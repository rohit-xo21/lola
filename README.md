# Lola

A web application similar to Kakeep for saving and organizing links, photos, and PDFs in one centralized place. Built with React, Express, and MongoDB.

## Features

- 🔗 Save and organize links
- 📸 Upload and store photos
- 📄 Save and manage PDF files
- 🔐 Google OAuth authentication
- 📱 Responsive design
- 🎯 Clean and minimal UI
- ⚡ Fast and lightweight

## Demo

<video width="100%" autoplay muted loop>
  <source src="./media/demo.webm" type="video/webm">
  Your browser does not support the video tag.
</video>

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** (optional) - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Passport** - Authentication
- **Google OAuth 2.0** - Social login

## Project Structure

```
lola/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Express backend
    ├── config/
    │   ├── database.js    # MongoDB connection
    │   └── passport.js    # Auth configuration
    ├── models/
    │   └── User.js        # User schema
    ├── routes/
    │   └── auth.js        # Auth endpoints
    ├── controllers/        # Business logic
    ├── middleware/         # Custom middleware
    ├── utils/              # Utility functions
    ├── server.js          # Main server file
    ├── .env.example       # Environment variables template
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or pnpm
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` and add:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/savevault
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CALLBACK_URL=http://localhost:5000/auth/google/callback
   SESSION_SECRET=your_secret_key
   ```

5. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credential (Web application)
   - Add `http://localhost:5000/auth/google/callback` as authorized redirect URI
   - Copy Client ID and Client Secret to `.env`

6. **Start MongoDB:**
   ```bash
   mongod
   ```

7. **Run the server:**
   ```bash
   # Development with auto-reload
   pnpm dev

   # Production
   pnpm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```

   Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user info

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/savevault
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

## Running the Application

### Terminal 1 - Start Backend
```bash
cd server
pnpm dev
```

### Terminal 2 - Start Frontend
```bash
cd client
pnpm dev
```

Visit `http://localhost:5173` in your browser.

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,
  displayName: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

## License

ISC

## Contributing

Feel free to fork, modify, and improve!
