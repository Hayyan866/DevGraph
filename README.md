# 🚀 DevGraph – AI Developer Knowledge Graph

DevGraph is a full-stack AI-powered web application that generates **dynamic learning roadmaps**, **project ideas**, and **technology relationships** based on user input.

Instead of hard-coded paths, DevGraph uses AI to create personalized learning journeys for developers.

---

## ✨ Features

- 🤖 **AI-Powered Roadmaps**
  - Generate step-by-step learning paths for any technology
- 🧠 **Typo-Tolerant Input**
  - Understands user input like “mren” → MERN Stack
- 🌐 **Interactive Knowledge Graph**
  - Visualize relationships between technologies
- 📚 **Course Suggestions**
  - Get relevant learning resources dynamically
- 💡 **Project Ideas**
  - AI-generated real-world projects for each step
- 📈 **Learning Progress Tracking**
  - Track your journey from beginner to advanced

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Flow (Graph Visualization)

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### AI Integration
- OpenAI API

---

## 📂 Project Structure
DevGraph/
├── backend/
│ ├── src/
│ ├── package.json
│ └── .env (not included)
├── frontend/
│ ├── src/
│ └── package.json
├── .gitignore
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Hayyan866/DevGraph.git
cd DevGraph
cd backend
npm install
PORT=5000
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_api_key
npm run dev
cd frontend
npm install
npm run dev
