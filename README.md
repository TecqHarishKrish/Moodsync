<<<<<<< HEAD
# Smart Alarm - AI-Driven Mood-Adaptive WebApp

A smart alarm application that uses AI to adapt wake times based on mood detection and sleep patterns.

## Features

- 🎯 **Smart Alarm System**: AI-driven wake time optimization
- 😊 **Mood Tracking**: Track your mood and correlate with sleep quality
- 📊 **Sleep Analytics**: Detailed insights into your sleep patterns
- 🔐 **Secure Authentication**: JWT-based user authentication
- 🎨 **Modern UI**: Built with Material-UI and React

## Tech Stack

### Backend
- Node.js & Express
- MongoDB (with Mongoose)
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 19
- Material-UI (MUI)
- React Router
- Axios for API calls
- Nivo for data visualization

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd h:\Mini_project\Smart_alarm
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure Environment Variables**
   
   The `.env` file should contain:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

   **Important MongoDB Setup Notes:**
   - Replace `<username>` with your MongoDB Atlas username
   - Replace `<password>` with your MongoDB Atlas password
   - If your password contains special characters, URL-encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `$` becomes `%24`
     - `%` becomes `%25`
     - `&` becomes `%26`
   - Replace `<cluster>` with your cluster address
   - Replace `<database>` with your database name (e.g., `smart_alarm`)

   Example:
   ```env
   MONGO_URI=mongodb+srv://myuser:myP%40ssw0rd@cluster0.abc123.mongodb.net/smart_alarm?retryWrites=true&w=majority
   ```

5. **Generate a secure JWT secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and replace `your_jwt_secret_key_here` in `.env`

### Running the Application

#### Development Mode (Both servers)
```bash
npm run dev
```
This runs both backend (port 5000) and frontend (port 3000) concurrently.

#### Backend Only
```bash
npm run server
```
Server will run on http://localhost:5000

#### Frontend Only
```bash
npm run client
```
Frontend will run on http://localhost:3000

#### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Sleep Data
- `POST /api/users/sleep-data` - Add sleep data (protected)

### AI Features
- `POST /api/ai/process-mood` - Process mood from image (protected)
- `GET /api/ai/sleep-insights` - Get sleep insights (protected)
- `GET /api/ai/optimal-wake-time` - Get optimal wake time recommendation (protected)

## Project Structure

```
Smart_alarm/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── contexts/      # React contexts (Auth, Snackbar)
│       ├── layouts/       # Layout components
│       ├── pages/         # Page components
│       └── App.js         # Main app component
├── server/                # Express backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Server entry point
├── .env                 # Environment variables (not in git)
├── .gitignore          # Git ignore file
└── package.json        # Backend dependencies

```

## Troubleshooting

### MongoDB Connection Issues

1. **Authentication Failed Error**
   - Verify your MongoDB Atlas username and password
   - Ensure your password is URL-encoded if it contains special characters
   - Check that your IP address is whitelisted in MongoDB Atlas (Network Access)

2. **Connection Timeout**
   - Check your internet connection
   - Verify the cluster address is correct
   - Ensure MongoDB Atlas cluster is running

3. **Database Access Issues**
   - Verify the database user has read/write permissions
   - Check that the database name in the connection string is correct

### Port Already in Use
If you get an EADDRINUSE error:
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

### Frontend Not Connecting to Backend
- Ensure backend is running on port 5000
- Check CORS settings in `server/index.js`
- Verify API_URL in `client/src/contexts/AuthContext.js`

## Security Notes

- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regularly update dependencies for security patches
- Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
=======
# Moodsync
AI Mood-Adaptive Alarm Clock
>>>>>>> 6410badf9c90a6fb53c8213c1a13593043c918f4
