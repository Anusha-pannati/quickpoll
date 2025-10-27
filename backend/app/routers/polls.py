from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.models.database import get_db
from app.models.user import User
from app.models.poll import Poll, PollOption, Vote, Like
from app.schemas.poll import (
    PollCreate, PollUpdate, PollResponse, PollOptionResponse,
    VoteCreate, VoteResponse, LikeResponse
)
from app.utils.security import decode_token
from app.services.websocket_manager import manager

router = APIRouter(prefix="/polls", tags=["polls"])

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    result = await db.execute(select(User).where(User.id == int(user_id)))
    return result.scalar_one_or_none()

async def get_current_user_required(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from JWT token (required)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
async def create_poll(
    poll_data: PollCreate,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    """Create a new poll."""
    if len(poll_data.options) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poll must have at least 2 options"
        )
    
    # Create poll
    new_poll = Poll(
        title=poll_data.title,
        description=poll_data.description,
        creator_id=current_user.id,
        allow_multiple_votes=poll_data.allow_multiple_votes
    )
    
    db.add(new_poll)
    await db.flush()
    
    # Create options
    for option_text in poll_data.options:
        option = PollOption(poll_id=new_poll.id, text=option_text)
        db.add(option)
    
    await db.commit()
    await db.refresh(new_poll)
    
    # Load relationships
    result = await db.execute(
        select(Poll)
        .options(selectinload(Poll.options), selectinload(Poll.creator))
        .where(Poll.id == new_poll.id)
    )
    poll = result.scalar_one()
    
    # Format response
    response = await format_poll_response(poll, current_user.id, db)
    
    # Broadcast new poll to global listeners with the full payload
    payload = response.model_dump(mode="json")
    await manager.broadcast_to_global({
        "type": "poll_created",
        "data": payload,
    })
    
    return response

@router.get("/", response_model=List[PollResponse])
async def get_polls(
    skip: int = 0,
    limit: int = 50,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all polls."""
    current_user = await get_current_user(authorization, db)
    
    result = await db.execute(
        select(Poll)
        .options(selectinload(Poll.options), selectinload(Poll.creator))
        .where(Poll.is_active == True)
        .order_by(Poll.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    polls = result.scalars().all()
    
    user_id = current_user.id if current_user else None
    return [await format_poll_response(poll, user_id, db) for poll in polls]

@router.get("/{poll_id}", response_model=PollResponse)
async def get_poll(
    poll_id: int,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific poll."""
    current_user = await get_current_user(authorization, db)
    
    result = await db.execute(
        select(Poll)
        .options(selectinload(Poll.options), selectinload(Poll.creator))
        .where(Poll.id == poll_id)
    )
    poll = result.scalar_one_or_none()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    user_id = current_user.id if current_user else None
    return await format_poll_response(poll, user_id, db)

@router.post("/{poll_id}/vote", response_model=VoteResponse)
async def vote_on_poll(
    poll_id: int,
    vote_data: VoteCreate,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    """Vote on a poll."""
    # Check if poll exists
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if not poll.is_active:
        raise HTTPException(status_code=400, detail="Poll is not active")
    
    # Check if option belongs to poll
    result = await db.execute(
        select(PollOption).where(
            and_(PollOption.id == vote_data.option_id, PollOption.poll_id == poll_id)
        )
    )
    option = result.scalar_one_or_none()
    
    if not option:
        raise HTTPException(status_code=400, detail="Invalid option for this poll")
    
    # Check if user already voted
    result = await db.execute(
        select(Vote).where(and_(Vote.poll_id == poll_id, Vote.user_id == current_user.id))
    )
    existing_vote = result.scalar_one_or_none()
    
    if existing_vote and not poll.allow_multiple_votes:
        raise HTTPException(status_code=400, detail="You have already voted on this poll")
    
    # Create vote
    new_vote = Vote(
        poll_id=poll_id,
        option_id=vote_data.option_id,
        user_id=current_user.id
    )
    
    db.add(new_vote)
    await db.commit()
    await db.refresh(new_vote)
    
    # Get updated vote counts
    vote_counts = await get_vote_counts(poll_id, db)
    
    # Broadcast vote update to all watching this poll
    await manager.broadcast_to_poll(poll_id, {
        "type": "vote_update",
        "data": {
            "poll_id": poll_id,
            "option_id": vote_data.option_id,
            "vote_counts": vote_counts,
            "total_votes": sum(vote_counts.values())
        }
    })
    
    return new_vote

@router.post("/{poll_id}/like", response_model=LikeResponse)
async def like_poll(
    poll_id: int,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    """Like a poll."""
    # Check if poll exists
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if already liked
    result = await db.execute(
        select(Like).where(and_(Like.poll_id == poll_id, Like.user_id == current_user.id))
    )
    existing_like = result.scalar_one_or_none()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="You have already liked this poll")
    
    # Create like
    new_like = Like(poll_id=poll_id, user_id=current_user.id)
    db.add(new_like)
    await db.commit()
    await db.refresh(new_like)
    
    # Get updated like count
    like_count = await get_like_count(poll_id, db)
    
    # Broadcast like update
    await manager.broadcast_to_poll(poll_id, {
        "type": "like_update",
        "data": {
            "poll_id": poll_id,
            "total_likes": like_count
        }
    })
    
    return new_like

@router.delete("/{poll_id}/like")
async def unlike_poll(
    poll_id: int,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    """Unlike a poll."""
    result = await db.execute(
        select(Like).where(and_(Like.poll_id == poll_id, Like.user_id == current_user.id))
    )
    like = result.scalar_one_or_none()
    
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    
    await db.delete(like)
    await db.commit()
    
    # Get updated like count
    like_count = await get_like_count(poll_id, db)
    
    # Broadcast like update
    await manager.broadcast_to_poll(poll_id, {
        "type": "like_update",
        "data": {
            "poll_id": poll_id,
            "total_likes": like_count
        }
    })
    
    return {"message": "Like removed"}

# Helper functions
async def get_vote_counts(poll_id: int, db: AsyncSession) -> dict:
    """Get vote counts for all options in a poll."""
    result = await db.execute(
        select(Vote.option_id, func.count(Vote.id))
        .where(Vote.poll_id == poll_id)
        .group_by(Vote.option_id)
    )
    return {option_id: count for option_id, count in result.all()}

async def get_like_count(poll_id: int, db: AsyncSession) -> int:
    """Get like count for a poll."""
    result = await db.execute(
        select(func.count(Like.id)).where(Like.poll_id == poll_id)
    )
    return result.scalar() or 0

async def format_poll_response(poll: Poll, user_id: Optional[int], db: AsyncSession) -> PollResponse:
    """Format poll data with vote counts and user interaction status."""
    vote_counts = await get_vote_counts(poll.id, db)
    like_count = await get_like_count(poll.id, db)
    
    # Check if user has voted
    user_has_voted = False
    user_voted_option_ids: List[int] = []
    if user_id:
        result = await db.execute(
            select(Vote).where(and_(Vote.poll_id == poll.id, Vote.user_id == user_id))
        )
        votes = result.scalars().all()

        user_voted_option_ids = [vote.option_id for vote in votes]

        if poll.allow_multiple_votes:
            user_has_voted = len(votes) > 0
        else:
            user_has_voted = len(votes) == 1
    
    # Check if user has liked
    user_has_liked = False
    if user_id:
        result = await db.execute(
            select(Like).where(and_(Like.poll_id == poll.id, Like.user_id == user_id))
        )
        user_has_liked = result.scalar_one_or_none() is not None
    
    # Format options with vote counts
    options = [
        PollOptionResponse(
            id=opt.id,
            poll_id=opt.poll_id,
            text=opt.text,
            vote_count=vote_counts.get(opt.id, 0)
        )
        for opt in poll.options
    ]
    
    return PollResponse(
        id=poll.id,
        title=poll.title,
        description=poll.description,
        creator_id=poll.creator_id,
        creator_username=poll.creator.username,
        is_active=poll.is_active,
        allow_multiple_votes=poll.allow_multiple_votes,
        created_at=poll.created_at,
        options=options,
        total_votes=sum(vote_counts.values()),
        total_likes=like_count,
        user_has_voted=user_has_voted,
        user_has_liked=user_has_liked,
        user_voted_options=user_voted_option_ids
    )