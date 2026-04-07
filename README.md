# Student Project Collaboration Platform

A full-stack web application for managing student projects, tasks, and contributions with a clean, formal design.

## 📦 Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **File Upload:** Multer
- **HTTP Client:** Axios
- **Styling:** Plain CSS with formal pastel colors

---

## 🚀 Quick Start (2 minutes)

### Prerequisites

- **Node.js** (v14+) - Download from https://nodejs.org/
- **MongoDB** - Download Community Server from https://www.mongodb.com/try/download/community

### One-Click Setup

1. **Run setup script** (installs dependencies and seeds database):
   ```batch
   setup.bat
   ```

2. **Start the application** (starts MongoDB, backend, and frontend):
   ```batch
   start.bat
   ```

That's it! The application will open automatically.

---

## 🎨 Features

- **User Authentication** (Student/Leader/Teacher roles)
- **Project Management** with team collaboration
- **Task Tracking** with progress monitoring
- **File Sharing** with upload/download
- **Dashboard** with statistics and activity feed
- **Responsive Design** with formal pastel colors

## 👥 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | alice@example.com | password123 |
| Project Leader | bob@example.com | password123 |
| Teacher | charlie@example.com | password123 |

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### Prerequisites

- **Node.js** (v14+)
- **MongoDB** running locally

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../vite-project
npm install
```

### Step 2: Seed Database

```bash
cd backend
npm run seed
```

### Step 3: Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd vite-project
npm run dev
```

---

## 🌐 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/status
```

**Expected output:**
```
✅ Demo users created successfully!
MongoDB connected
Backend running on http://localhost:5000
```

### Step 3: Setup Frontend (new terminal)

```powershell
cd vite-project

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Login

1. Open http://localhost:5173
2. See **3 demo buttons** (Student, Leader, Teacher)
3. Click any button
4. Fields auto-fill
5. Click **"Login"**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@college.edu | Student@123 |
| **Leader** | leader@college.edu | Leader@123 |
| **Teacher** | teacher@college.edu | Teacher@123 |

---

## 📁 Project Structure

```
Project-Colaborator/
├── backend/
│   ├── config/
│   │   └── db.js                    (MongoDB connection)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── contributionController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── auth.js                  (JWT verification)
│   │   ├── roles.js                 (Role-based access)
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── File.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── contribution.js
│   │   └── files.js
│   ├── uploads/                     (File storage)
│   ├── server.js
│   ├── seed.js                      (Demo data)
│   ├── .env                         (Environment variables)
│   ├── package.json
│   └── README.md
│
└── vite-project/
    ├── src/
    │   ├── App.jsx                  (Main React app)
    │   ├── App.css                  (Styling)
    │   ├── main.jsx
    │   ├── index.css
    │   └── assets/
    ├── .env                         (API URL config)
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register              (public)
POST   /api/auth/login                 (public)
GET    /api/auth/me                    (protected)
GET    /api/auth/users                 (protected: Leader/Teacher)
```

### Projects
```
POST   /api/projects                   (protected: Leader/Teacher)
GET    /api/projects                   (protected)
GET    /api/projects/:id               (protected)
PUT    /api/projects/:id               (protected: Leader/Teacher)
DELETE /api/projects/:id               (protected: Leader/Teacher)
```

### Tasks
```
POST   /api/tasks                      (protected: Leader)
GET    /api/tasks                      (protected)
GET    /api/tasks/project/:projectId   (protected)
PUT    /api/tasks/:id                  (protected)
DELETE /api/tasks/:id                  (protected: Leader)
```

### Contribution & Reports
```
GET    /api/contribution/:projectId    (protected)
POST   /api/files                      (protected, multipart/form-data)
GET    /api/files/:projectId           (protected)
```

---

## 🎨 Frontend Pages

- **Login** (`/login`) - Demo credentials available
- **Register** (`/register`) - Create new account
- **Dashboard** (`/dashboard`) - Overview & stats
- **Projects** (`/projects`) - List & create projects
- **Project Details** (`/projects/:id`) - Tasks & files
- **Tasks** (`/tasks`) - Manage tasks
- **Contributions** (`/contributions`) - Track contributions
- **Reports** (`/reports`) - Project reports
- **Profile** (`/profile`) - User profile

---

## 🔧 Environment Variables

### Backend (backend/.env)

```env
MONGO_URI=mongodb://localhost:27017/student-collab
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Frontend (vite-project/.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Common Issues & Solutions

### Issue: "MongoDB connection failed"

**Solution:**
1. Ensure MongoDB is running:
   ```powershell
   Get-Process mongod -ErrorAction SilentlyContinue
   ```
2. If not running, start it:
   ```powershell
   mongod
   ```
3. Or update `MONGO_URI` in `.env` to use MongoDB Atlas

### Issue: "Login fails / Invalid credentials"

**Solution:**
1. Seed the database:
   ```powershell
   cd backend
   npm run seed
   ```
2. Check if backend shows `MongoDB connected`
3. Open browser console (F12) and check error messages

### Issue: "Cannot connect to backend from frontend"

**Solution:**
1. Verify backend is running on `http://localhost:5000`
2. Check `VITE_API_URL` in `vite-project/.env`
3. Check CORS is enabled (it is in `server.js`)
4. Check browser console for network errors

### Issue: "Port 5000 already in use"

**Solution:**
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property ProcessName, @{Name="PID";Expression={$_.OwningProcess}}

# Kill the process
Stop-Process -Id <PID> -Force
```

---

## 🚀 Deployment Checklist

- [ ] Change JWT_SECRET in production
- [ ] Update MONGO_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Setup proper error logging

---

## 📝 Features

✅ User authentication with JWT  
✅ Role-based access control (Student, Leader, Teacher)  
✅ Project management  
✅ Task assignment & tracking  
✅ Contribution tracking  
✅ File upload support  
✅ User profiles  
✅ Responsive design  
✅ Clean, modern UI  

---

## 🧪 Testing Workflow

1. **Register/Login** as Student
2. **Create Project** (switch to Leader role)
3. **Add Members** to project
4. **Create Tasks** and assign to students
5. **Update Task Status** (as student)
6. **View Contributions** and reports
7. **Upload Files** to project

---

## 📞 Support

If you encounter issues:

1. Check backend logs for errors
2. Check browser DevTools Console (F12)
3. Verify MongoDB connection
4. Ensure all services are running on correct ports
5. Check `.env` files are configured correctly

---

## 📄 License

MIT

---

## 👨‍💻 Author

Built with ❤️ for student collaboration
