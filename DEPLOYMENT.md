# 🚀 EcoScan Deployment Guide

This guide will help you deploy EcoScan to production. The project consists of three main components:

1. **Frontend** (Next.js) - Deploy to Vercel (Recommended)
2. **Backend** (Go) - Deploy to Render/Railway
3. **ML Service** (Python/Flask) - Deploy to Render/Railway

## 📋 Prerequisites

- GitHub account (already have ✅)
- Vercel account (free tier available)
- Render/Railway account (free tier available)
- MongoDB Atlas account (free tier available)
- AWS account (for S3 storage)
- Gemini API key

## 🎯 Deployment Strategy

### Option 1: Full Deployment (Recommended for Production)
- **Frontend**: Vercel
- **Backend**: Render/Railway
- **ML Service**: Render/Railway
- **Database**: MongoDB Atlas
- **Storage**: AWS S3

### Option 2: Quick Demo (Frontend Only)
- **Frontend**: Vercel (with environment variables)
- **Backend & ML**: Run locally or use mock data

## 🌐 Step 1: Deploy Frontend to Vercel

### 1.1 Prepare Frontend for Deployment

1. **Update API endpoints** (if using localhost):
   - Replace `http://localhost:8080` with your backend URL
   - Replace `http://localhost:5001` with your ML service URL

2. **Set up environment variables in Vercel**:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_ML_URL=https://your-ml-service.onrender.com
   ```

### 1.2 Deploy to Vercel

**Method 1: Using Vercel CLI**
```bash
cd Frontend
npm i -g vercel
vercel login
vercel
```

**Method 2: Using GitHub Integration (Recommended)**
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `priyanshu30405/EcoScan` repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables (see above)
7. Click "Deploy"

### 1.3 Get Your Frontend URL
After deployment, Vercel will provide a URL like:
- `https://ecoscan.vercel.app`
- Or your custom domain

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Web Service

1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `priyanshu30405/EcoScan`
5. Configure service:
   - **Name**: `ecoscan-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Go`
   - **Build Command**: `go mod download && go build -o main`
   - **Start Command**: `./main`
   - **Instance Type**: Free tier

6. **Add Environment Variables**:
   ```
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   S3_BUCKET_NAME=your_bucket_name
   GEMINI_API_KEY=your_gemini_api_key
   FLASK_SERVER_URL=https://your-ml-service.onrender.com
   PORT=8080
   ```

7. Click "Create Web Service"

### 2.2 Get Your Backend URL
After deployment, Render will provide a URL like:
- `https://ecoscan-backend.onrender.com`

## 🤖 Step 3: Deploy ML Service to Render

### 3.1 Create Render Web Service for ML

1. In Render, click "New +" → "Web Service"
2. Connect your GitHub repository: `priyanshu30405/EcoScan`
3. Configure service:
   - **Name**: `ecoscan-ml`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `ml`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: Free tier

4. **Add Environment Variables**:
   ```
   FLASK_ENV=production
   PORT=5001
   ```

5. **Important**: Upload your model file (`3RVision_2 (1).keras`) or host it on S3

6. Click "Create Web Service"

### 3.2 Get Your ML Service URL
After deployment, Render will provide a URL like:
- `https://ecoscan-ml.onrender.com`

## 🗄️ Step 4: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `ecoscan`

## ☁️ Step 5: Set up AWS S3

1. Go to [AWS Console](https://aws.amazon.com)
2. Create an S3 bucket
3. Create IAM user with S3 permissions
4. Get Access Key ID and Secret Access Key
5. Update environment variables in Render (Backend service)

## 🔗 Step 6: Update Frontend Environment Variables

After deploying all services, update your Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://ecoscan-backend.onrender.com
   NEXT_PUBLIC_ML_URL=https://ecoscan-ml.onrender.com
   ```
3. Redeploy your frontend

## 📝 Step 7: Update GitHub README

1. Add deployment badges to README.md
2. Add live demo link
3. Update documentation

## ✅ Verification Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] ML Service deployed to Render
- [ ] MongoDB Atlas configured
- [ ] AWS S3 configured
- [ ] Environment variables set in all services
- [ ] Frontend can connect to backend
- [ ] Backend can connect to ML service
- [ ] Image upload works
- [ ] Analysis feature works
- [ ] User authentication works

## 🐛 Troubleshooting

### Frontend Issues
- Check environment variables in Vercel
- Verify API endpoints are correct
- Check CORS settings in backend

### Backend Issues
- Check environment variables in Render
- Verify AWS credentials
- Check ML service URL

### ML Service Issues
- Verify model file is accessible
- Check Python dependencies
- Verify Flask is running on correct port

## 🔄 Continuous Deployment

All services are set up for automatic deployment:
- Push to `main` branch → Auto-deploy to Vercel/Render
- No manual deployment needed

## 📊 Monitoring

- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check logs in Render dashboard
- **MongoDB**: Monitor in Atlas dashboard
- **AWS**: Monitor in CloudWatch

## 🆓 Free Tier Limits

- **Vercel**: Unlimited deployments, 100GB bandwidth
- **Render**: 750 hours/month free tier
- **MongoDB Atlas**: 512MB storage
- **AWS S3**: 5GB storage (first year free)

## 🔒 Security Notes

1. Never commit `.env` files to GitHub
2. Use strong JWT secrets
3. Enable CORS properly
4. Use HTTPS for all services
5. Rotate API keys regularly

## 📞 Support

If you encounter issues:
1. Check service logs
2. Verify environment variables
3. Check network connectivity
4. Review deployment documentation

---

## 🚀 Quick Deploy Commands

```bash
# Deploy Frontend to Vercel
cd Frontend
vercel --prod

# Deploy Backend to Render (via GitHub)
# Just push to main branch, Render auto-deploys

# Deploy ML Service to Render (via GitHub)
# Just push to main branch, Render auto-deploys
```

---

**Happy Deploying! 🎉**

