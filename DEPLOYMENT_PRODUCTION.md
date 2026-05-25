# Stock Screener Pro - Production Deployment Guide

## Pre-Deployment Checklist

### 1. GitHub Repository Setup
```bash
# Initialize git repo (if not already done)
cd c:\Users\YTANNU\Downloads\stock-screener-pro\stock-screener
git init
git add .
git commit -m "Initial commit: stock screener pro"
git branch -M main

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/stock-screener-pro.git
git push -u origin main
```

### 2. Environment Variables Setup

#### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/stock-screener?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_string_min_32_chars
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-vercel-domain.vercel.app
API_KEY_FINNHUB=your_finnhub_api_key
API_KEY_ALPHAVANTAGE=your_alphavantage_api_key
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
NEXT_PUBLIC_DATA_MODE=live
```

## Deployment Steps

### Step 1: MongoDB Atlas Setup (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in or create account
3. Create new project → Create Cluster (M0 Free tier)
4. Configure security:
   - Network Access: Add IP 0.0.0.0/0 (or your IPs)
   - Database Users: Create user with username/password
5. Get connection string from "Connect" → "Drivers"
6. Copy MONGODB_URI to backend .env

### Step 2: Backend Deployment to Render (10 minutes)
1. Push code to GitHub (see above)
2. Go to https://render.com
3. Sign in with GitHub
4. New → Web Service
5. Select your `stock-screener-pro` repository
6. Configure:
   - Name: `stock-screener-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
7. Add environment variables (click "Advanced"):
   - PORT: 5000
   - NODE_ENV: production
   - MONGODB_URI: (from MongoDB Atlas)
   - JWT_SECRET: (generate strong random)
   - JWT_EXPIRE: 7d
   - CORS_ORIGIN: (update after Vercel deployment)
   - Add any API keys
8. Deploy (click "Create Web Service")
9. Wait for deployment → Copy the deployed URL (e.g., https://stock-screener-backend.onrender.com)

### Step 3: Frontend Deployment to Vercel (10 minutes)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import Project
4. Select `stock-screener-pro` repository
5. Configure:
   - Project Name: `stock-screener-pro`
   - Root Directory: `.` (root)
   - Framework: Next.js
   - Build Command: `npm run build`
6. Add environment variables:
   - NEXT_PUBLIC_API_URL: `https://stock-screener-backend.onrender.com/api`
7. Deploy (click "Deploy")
8. Wait for deployment → Copy the Vercel domain (e.g., https://stock-screener-pro.vercel.app)

### Step 4: Update CORS on Render Backend (5 minutes)
1. Go back to Render dashboard
2. Select your backend service
3. Go to Environment
4. Update CORS_ORIGIN: `https://your-vercel-domain.vercel.app`
5. Save and redeploy (manual deploy)

## Post-Deployment Testing

### Test Backend Health
```
GET https://stock-screener-backend.onrender.com/api/health
```
Expected: `{ status: "ok" }`

### Test Authentication Endpoints
```
POST https://stock-screener-backend.onrender.com/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

### Test Frontend
- Visit: https://your-vercel-domain.vercel.app
- Click "Sign In" button
- Try signing up with test credentials
- Verify login works and token is stored

### Test API Connection
- Open browser DevTools (F12)
- Go to Network tab
- Try signing in
- Check that API calls go to your Render backend
- Verify token is stored in localStorage

## Important Notes

⚠️ **Security Warnings:**
- Change JWT_SECRET to a strong random string
- Enable API key restrictions on Finnhub/AlphaVantage
- Don't commit .env files (use .env.example template)
- Set CORS_ORIGIN to exact domain only
- Use HTTPS everywhere (automatic on Vercel/Render)

⚠️ **Render Free Tier Limitations:**
- Services spin down after 15 min of inactivity
- First request after spin-down takes ~30 seconds
- For production, consider upgrading to paid tier

⚠️ **MongoDB Atlas:**
- M0 tier limited to 512MB storage
- No auto-backup on free tier
- Upgrade for production workloads

## Monitoring & Logs

### View Render Logs
```
https://dashboard.render.com → Select service → Logs
```

### View Vercel Logs
```
https://vercel.com → Select project → Deployments
```

### View MongoDB Atlas Logs
```
https://cloud.mongodb.com → Select cluster → Monitoring
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend 503 Error | Check Render logs, verify MongoDB connection |
| Frontend can't reach backend | Verify CORS_ORIGIN matches Vercel domain |
| Login fails | Check MONGODB_URI, verify JWT_SECRET is set |
| 502 Bad Gateway | Service may be spinning up, wait 30 seconds |
| CORS error | Update CORS_ORIGIN on backend to match frontend URL |

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Setup MongoDB Atlas cluster
3. ✅ Deploy backend to Render
4. ✅ Deploy frontend to Vercel
5. ✅ Update CORS on Render
6. ✅ Test all endpoints
7. 🔄 Setup monitoring (optional)
8. 🔄 Add custom domain (optional)
9. 🔄 Enable 2FA on backend (optional)

---
**Estimated total time: 30-45 minutes**
