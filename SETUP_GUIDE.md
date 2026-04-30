# Stock Screener Pro - Advanced Setup Guide

## 🚀 Project Architecture

```
stock-screener-pro/
├── frontend/          (Next.js - React TypeScript)
├── backend/           (Express.js - Node.js)
├── docker-compose.yml (Local development)
└── docs/              (Documentation & guides)
```

## 📋 Quick Start (Local Development)

### Prerequisites
- Node.js 20+ and npm
- Docker & Docker Compose (optional, for containerized setup)
- MongoDB (local or Atlas)
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd stock-screener-pro

# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MONGODB_URI in .env
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-screener

# Start backend (development)
npm run dev

# Or build and run production
npm run build
npm start
```

#### Frontend Setup
```bash
# In the root directory
npm install

# Create .env.local
cp .env.example .env.local

# Update NEXT_PUBLIC_API_URL in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start frontend (development)
npm run dev

# Frontend will be available at http://localhost:3000
```

## 🔐 Authentication Flow

### Sign Up
1. User enters email, password, and name
2. Frontend sends request to `POST /api/auth/signup`
3. Backend validates and hashes password with bcryptjs
4. User saved to MongoDB
5. JWT token generated and sent to frontend
6. Token stored in localStorage

### Sign In
1. User enters email and password
2. Frontend sends request to `POST /api/auth/signin`
3. Backend validates credentials
4. JWT token generated and sent to frontend
5. Token used for subsequent authenticated requests

### Token Management
```typescript
// Include token in Authorization header
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import GitHub repository
   - Select project root (stock-screener-pro/stock-screener)
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL`: https://your-backend-url.com/api

3. **Deploy**
   - Vercel automatically deploys on push to main

### Backend Deployment (Render)

1. **Deploy on Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Select backend folder as Root Directory
   - Environment variables:
     - `MONGODB_URI`: Connection string from MongoDB Atlas
     - `JWT_SECRET`: Strong random string
     - `CORS_ORIGIN`: https://your-frontend-url.vercel.app
     - `NODE_ENV`: production

2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Auto-deploy**: Enable on push to main

### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free account
   - Create cluster (M0 tier is free)

2. **Create Database User**
   - Go to Database Access
   - Add database user with password
   - Note the username and password

3. **Get Connection String**
   - Go to Clusters > Connect
   - Choose "Drivers"
   - Copy connection string
   - Replace `<username>`, `<password>`, and `<dbname>`

4. **Update .env Files**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-screener
   ```

## 📊 Real-World Data Integration

### Currently Supported APIs
- **Finnhub** (WebSocket for real-time)
- **Alpha Vantage** (REST, free tier)
- **NewsAPI** (News aggregation)

### Setup Instructions

#### Finnhub Integration
```bash
# Get free API key at https://finnhub.io

# Add to backend .env
FINNHUB_API_KEY=your_api_key

# Usage in backend/src/routes/stocks.ts
const stockData = await finnhubClient.quote(symbol);
```

#### Alpha Vantage Integration
```bash
# Get free API key at https://www.alphavantage.co

# Add to backend .env
ALPHA_VANTAGE_API_KEY=your_api_key

# Usage
const data = await axios.get('https://www.alphavantage.co/query', {
  params: {
    function: 'QUOTE_ENDPOINT',
    symbol,
    apikey: process.env.ALPHA_VANTAGE_API_KEY
  }
});
```

## 🎨 UI/UX Features

### Modern Design System
- **Typography**: Inter, Poppins, IBM Plex Sans
- **Colors**: Custom gradient scheme (dark theme)
- **Components**: Glassmorphism + Neumorphism cards
- **Animations**: GSAP for smooth transitions
- **3D**: Three.js for cinematic backgrounds

### Key Components
- Floating Navbar with auth state
- Auth Modal (sign in/sign up)
- Market sentiment panel
- Stock card groups (gainers, losers, active)
- Real-time ticker tape
- Detailed data view with charts

## 🚨 Error Handling & Debugging

### Backend Errors
```typescript
// Validation errors → 400
// Authentication errors → 401
// Email already exists → 409
// Server errors → 500
```

### Frontend Error Display
- Error messages shown in auth modal
- Toast notifications for API errors
- Graceful fallback to simulated data

### Common Issues

1. **CORS Error**: Check CORS_ORIGIN in backend .env
2. **MongoDB Connection**: Verify MONGODB_URI and network access
3. **Token Expiry**: Implement refresh token logic
4. **API Rate Limiting**: Implement caching and request throttling

## 🔒 Security Best Practices

- ✅ JWT tokens for authentication
- ✅ Bcryptjs for password hashing (10 salt rounds)
- ✅ HTTPS in production (Vercel/Render handle this)
- ✅ CORS restrictions to frontend origin
- ✅ Input validation with express-validator
- ✅ Environment variables for secrets
- ⚠️ TODO: Implement refresh tokens
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Implement 2FA

## 📈 Performance Optimization

### Frontend
- ✅ Dynamic imports for heavy components
- ✅ Lazy loading of Three.js backgrounds
- ✅ Zustand for efficient state management
- ✅ Debounced stock price updates
- 🔧 Image optimization with Next.js
- 🔧 Code splitting by route

### Backend
- ✅ MongoDB indexing on frequently queried fields
- ✅ In-memory caching with node-cache
- 🔧 Pagination for large datasets
- 🔧 Database query optimization

## 🧪 Testing & Quality

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test

# Type checking
npm run type-check
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix formatting
npm run lint:fix
```

## 📞 Support & Contribution

- **Issues**: Please report bugs on GitHub
- **Pull Requests**: Follow commit conventions
- **Documentation**: Keep docs up-to-date

## 📄 License

MIT License - See LICENSE file

---

**Last Updated**: 2026-04-30
**Version**: 1.0.0
