from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

# Poll Option Schemas
class PollOptionBase(BaseModel):
    text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOptionResponse(PollOptionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    poll_id: int
    vote_count: int = 0

# Poll Schemas
class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    options: List[str]
    allow_multiple_votes: bool = False

class PollUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    description: Optional[str]
    creator_id: int
    creator_username: str
    is_active: bool
    allow_multiple_votes: bool
    created_at: datetime
    options: List[PollOptionResponse]
    total_votes: int = 0
    total_likes: int = 0
    user_has_voted: bool = False
    user_has_liked: bool = False
    user_voted_options: List[int] = []

# Vote Schemas
class VoteCreate(BaseModel):
    option_id: int

class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    poll_id: int
    option_id: int
    user_id: int
    created_at: datetime

# Like Schemas
class LikeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    poll_id: int
    user_id: int
    created_at: datetime