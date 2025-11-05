# SlotSwapper

A full-stack inspired **React application** for managing and swapping user event slots. Users can create events, mark them as swappable, browse available slots, and send or respond to swap requests.  

## Live Demo

- **Frontend**: [https://servicehive-brown.vercel.app/](https://servicehive-brown.vercel.app/)  
- **Backend API**: [https://servicehive-yh5n.onrender.com](https://servicehive-yh5n.onrender.com)

## Features

### Authentication
- Signup and login functionality
- Protected routes for authenticated users only
- Logout support

### Dashboard
- Create, view, and manage personal events
- Mark events as **swappable** to allow others to request swaps
- Event status indicators (Busy, Swappable, Swap Pending)

### Marketplace
- Browse **swappable slots** from other users
- Select your own swappable event to request a swap
- Real-time feedback with **React Toastify** notifications

### Requests
- View **incoming** swap requests and respond (Accept/Reject)
- View **outgoing** swap requests and track their status
- Real-time updates after actions

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, React Toastify
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **API Requests**: Axios
- **Routing**: React Router
- **Authentication**: Context API for user state and token management


## Installation

### 1. Clone the repository

git clone https://github.com/JatinnVaityy/servicehive.git

cd servicehive

## 2. Backend Setup

cd backend

npm install

node server.js

The backend will run on your configured port (default: http://localhost:5000 or as set in your .env).

PORT=5000

MONGO_URI=

JWT_SECRET=

JWT_EXPIRES_IN=

## 3. Frontend Setup

cd frontend

npm install

npm run dev

The frontend will run at http://localhost:5173.

Create a .env file in the frontend folder and add the following:

REACT_APP_API_URL=http://localhost:5000/api
