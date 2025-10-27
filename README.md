# 🗳️ QuickPoll — Real-Time Opinion Polling Platform

A full-stack real-time polling web application that lets users **create polls, vote, like polls, and see live updates instantly**.  
Built with **FastAPI**, **Next.js**, and **WebSockets**, QuickPoll ensures an interactive and dynamic user experience.

---

## 🚀 Features

- 🧩 **Create Polls** — Users can create polls with multiple options.  
- ✅ **Vote System** — Single or multiple-choice polls supported.  
- ❤️ **Like System** — Users can like/unlike polls in real time.  
- 🔄 **Live Updates** — WebSocket-powered updates for votes and likes across all connected users.  
- 👤 **User Authentication** — JWT-based authentication and protected routes.  
- 🎨 **Modern UI** — Built using **Next.js**, **Tailwind CSS**, and **shadcn/ui** for a clean and responsive interface.  
- 🐳 **Dockerized Database** — Database runs inside Docker for easy setup and management.

---

## 🧠 Tech Stack

### **Frontend**
- [Next.js 15](https://nextjs.org/) — React framework for production-grade web apps  
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling  
- [shadcn/ui](https://ui.shadcn.com/) — Elegant prebuilt UI components  
- [Framer Motion](https://www.framer.com/motion/) — Smooth animations  
- [Redux Toolkit](https://redux-toolkit.js.org/) — State management   

### **Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework  
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM for database modeling    
- [WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) — Real-time communication  
- [PostgreSQL](https://www.postgresql.org/) — Database (running via Docker)  
- [JWT Auth](https://jwt.io/) — Secure authentication  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/quickpoll.git
cd quickpoll
````

---

### 2️⃣ Setup the Backend

#### Create a Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Start FastAPI Server

```bash
uvicorn app.main:app --reload
```

By default, the backend runs on:
👉 **[http://localhost:8000](http://localhost:8000)**

---

### 3️⃣ Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 WebSocket Functionality

Real-time updates are powered by **FastAPI WebSockets**:

* When a user **votes**, **likes**, or **creates** a poll, updates are broadcast instantly.
* Frontend listens for WebSocket events and updates UI live.

Event Types:

```json
{
  "type": "poll_created",
  "data": { "poll_id": 1, "title": "Favorite Framework?", "creator": "anusha" }
}

{
  "type": "vote_update",
  "data": { "poll_id": 1, "option_id": 3, "vote_counts": { "3": 10 }, "total_votes": 50 }
}

{
  "type": "like_update",
  "data": { "poll_id": 1, "total_likes": 8 }
}
```

---

## 🧩 Environment Variables

Create a `.env` file inside the backend directory:

```
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/quickpoll
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=quickpoll

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000


# Debug
DEBUG=True

```

Create a `.env` file inside the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=your-secret-key

```


---

## 🧪 Development Notes

* All user interactions (create, vote, like) are logged for debugging.
* WebSocket connections are managed via a centralized `ConnectionManager`.
* Frontend uses Redux to manage global poll state and WebSocket messages.
* Backend ensures secure, token-based API access.

---

## 📦 Backend Dependencies

See `backend/requirements.txt`:

```
fastapi==0.115.0
SQLAlchemy==2.0.35
uvicorn==0.32.0
websockets==15.0.1
asyncpg==0.30.0
pydantic==2.9.2
python-jose==3.3.0
bcrypt==4.0.1
```

---

## 🎨 Frontend Dependencies

See `frontend/package.json`:

* **Frameworks:** `next`, `react`, `redux`
* **UI & Styling:** `tailwindcss`, `shadcn/ui`, `framer-motion`
* **API:** `axios`

---

## 🧹 .gitignore Example

```gitignore
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.env
venv/
alembic.ini

# Node
node_modules/
.next/
.env.local
dist/
build/
npm-debug.log*

# Docker
docker-data/
```

---

## 🤝 Contributing

Contributions are welcome!
Please fork the repo, make your changes, and submit a pull request.

---


## ✨ Author

**Anusha**
💻 Full Stack Developer — Passionate about building interactive and real-time applications.

---


