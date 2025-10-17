# 🎧 Harmoniq — AI-Driven Music Recommendation & Streaming Platform

Harmoniq is a modern music streaming web application that intelligently recommends songs using AI-based audio analysis.  
It features personalized radio stations, user playlists and an elegant Vue-based interface for seamless interaction.

---

## 🚀 Features

### 🌟 User Experience
- Beautiful, responsive UI built with **Vue 3 + TailwindCSS**
- Smooth animations and transitions across components
- Personalized homepage with:
  - **Recently played tracks**
  - **Quick picks**
  - **Recommended albums**
  - **New releases**
  - **Favorite artists**

### 🧠 AI-Powered Recommendations
- Song similarity determined by **cosine similarity** of audio feature embeddings
- Smart radio functionality generates playlists based on currently playing songs
- Tracks classified by **genre and mood** via deep learning models

### 💾 Backend
- **Express.js + PostgreSQL** architecture
- **RESTful API** for music data, playlists and user profiles
- Secure JWT-based authentication system

### 🖥️ Admin Tools
- User, Artist, Song management
- Album publishing and visibility management
- Artist verification and track analytics dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Vue 3, Pinia, TailwindCSS |
| **Backend** | Node.js (Express.js) |
| **Database** | PostgreSQL |
| **AI/ML** | TensorFlow / Librosa (Feature Extraction) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/sdmdg/Harmoniq
cd harmoniq
```

### 🚀 2️⃣ Install Dependencies

#### 🖥️ Frontend
```bash
cd frontend
npm install
```

#### ⚙️ Backend (Main Server)
```bash
cd backend/src
npm install
```

#### 💾 Backend (File Server)
```bash
cd backend/file_server
npm install
```

#### 🧠 Backend (AI Module)

##### 🪟 Windows
```bash
cd backend/ai_module
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

##### 🐧 Linux / macOS
```bash
cd backend/ai_module
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### ⚙️ 3️⃣ Configure Environment Variables

#### 🌐 Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend` directory and add:
```bash
VITE_FILE_SERVER=http://localhost:3000
VITE_BACKEND_SERVER=http://localhost:5000
```

#### 🔒 Backend Server (`backend/src/.env`)
Create another `.env` file inside `backend/src`:
```bash
JWT_SECRET=your-secret-key
PORT=5000

PGUSER=your_db_user
PGHOST=your_db_host
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=5432

VITE_FILE_SERVER=http://localhost:3001
VITE_SERVER=http://localhost:80

MAIL_APP_PWD=
MAIL_APP_EMAIL=
MAIL_APP_FILE_SERVER_PUBLIC=
```


---

### ▶️ 4️⃣ Run the Application

#### 🎨 Frontend
```bash
cd frontend
npm run dev
```

#### ⚙️ Backend Server
```bash
cd backend/src
npm run dev
```

#### 💾 Backend File Server
```bash
cd backend/file_server
npm run dev
```

#### 🧠 Backend AI Module

##### 🪟 Windows
```bash
cd backend/ai_module
venv\Scripts\activate
python main.py
```

##### 🐧 Linux / macOS
```bash
cd backend/ai_module
source venv/bin/activate
python3 main.py
```

---

### 🌍 Access the App
Once all servers are running, open your browser and go to:

👉 **http://localhost:5173**

You’ll now have the **full Harmoniq system** running — frontend, backend, AI module and file server — working together 🎧🔥

---

## 📜 License

MIT License — Developed by **Team Harmoniq**  
University of Moratuwa — Department of Computer Science and Engineering

---

## 👥 Team

- [Malaka Gunawardana](https://github.com/sdmdg)
- [Semini Sawbhagya](https://github.com/Semini-Sawbhagya)
- [Pawani Hasara](https://github.com/Pawani328)

---
🎶 *“Let the music flow — smartly, beautifully, and personally.”*
