# 🚀 Quick Deployment Guide for EcoScan

This guide will help you quickly deploy EcoScan to production.

## 📋 Prerequisites

- GitHub account ✅ (You already have this)
- Vercel account (free) - Sign up at https://vercel.com
- Render account (free) - Sign up at https://render.com
- MongoDB Atlas account (free) - Sign up at https://www.mongodb.com/cloud/atlas
- AWS account (for S3) - Sign up at https://aws.amazon.com
- Gemini API key - Get from https://makersuite.google.com/app/apikey

## 🎯 Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**:
   - Select `priyanshu30405/EcoScan`
   - Click "Import"
5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `Frontend` ⚠️ IMPORTANT
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
6. **Environment Variables** (Click "Environment Variables"):
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_random_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_ML_URL=https://ecoscan-ml.onrender.com
   NEXT_PUBLIC_BACKEND_URL=https://ecoscan-backend.onrender.com
   ```
   ⚠️ **Note**: You'll update the ML and Backend URLs after deploying those services.

7. **Click "Deploy"**
8. **Wait for deployment** (2-3 minutes)
9. **Copy your deployment URL** (e.g., `https://ecoscan.vercel.app`)

### Option B: Using Vercel CLI

```bash
cd Frontend
npm i -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

## 🤖 Step 2: Deploy ML Service to Render (10 minutes)

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect Repository**: Select `priyanshu30405/EcoScan`
5. **Configure Service**:
   - **Name**: `ecoscan-ml`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `ml`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: Free
6. **Environment Variables**:
   ```
   FLASK_ENV=production
   PORT=5001
   ```
7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your service URL** (e.g., `https://ecoscan-ml.onrender.com`)

## 🔧 Step 3: Deploy Backend to Render (10 minutes)

1. **In Render, click "New +" → "Web Service"**
2. **Connect Repository**: Select `priyanshu30405/EcoScan`
3. **Configure Service**:
   - **Name**: `ecoscan-backend`
   - **Region**: Same as ML service
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Go`
   - **Build Command**: `cd Backend && go mod download && go build -o main`
   - **Start Command**: `cd Backend && ./main`
   - **Instance Type**: Free
4. **Environment Variables**:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   S3_BUCKET_NAME=your_bucket_name
   GEMINI_API_KEY=your_gemini_api_key
   FLASK_SERVER_URL=https://ecoscan-ml.onrender.com
   PORT=8080
   ```
5. **Click "Create Web Service"**
6. **Wait for deployment** (5-10 minutes)
7. **Copy your service URL** (e.g., `https://ecoscan-backend.onrender.com`)

## 🔄 Step 4: Update Frontend Environment Variables

1. **Go back to Vercel Dashboard**
2. **Select your project** → **Settings** → **Environment Variables**
3. **Update these variables**:
   ```
   NEXT_PUBLIC_ML_URL=https://ecoscan-ml.onrender.com
   NEXT_PUBLIC_BACKEND_URL=https://ecoscan-backend.onrender.com
   ```
4. **Redeploy** your frontend (Vercel will auto-redeploy on next push, or click "Redeploy")

## 🗄️ Step 5: Set up MongoDB Atlas (5 minutes)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a free cluster** (M0)
3. **Create a database user**:
   - Database Access → Add New User
   - Username: `ecoscan`
   - Password: Generate secure password
4. **Whitelist IP addresses**:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow all) or your specific IPs
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `ecoscan`
6. **Update Vercel environment variable**:
   - `MONGODB_URI=mongodb+srv://ecoscan:password@cluster.mongodb.net/ecoscan?retryWrites=true&w=majority`

## ☁️ Step 6: Set up AWS S3 (10 minutes)

1. **Go to AWS Console**: https://aws.amazon.com
2. **Create S3 bucket**:
   - Name: `ecoscan-uploads` (or your preferred name)
   - Region: Choose closest to you
   - Uncheck "Block all public access" (if you want public URLs)
3. **Create IAM user**:
   - IAM → Users → Add User
   - Username: `ecoscan-s3-user`
   - Access type: Programmatic access
   - Attach policy: `AmazonS3FullAccess`
4. **Save credentials**:
   - Access Key ID
   - Secret Access Key
5. **Update Render environment variables** (Backend service):
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   S3_BUCKET_NAME=ecoscan-uploads
   ```

## ✅ Step 7: Verify Deployment

1. **Visit your frontend URL**: `https://ecoscan.vercel.app`
2. **Test features**:
   - Upload an image
   - Check analysis results
   - Test user authentication
   - Test community features

## 🔗 Step 8: Update GitHub README

1. **Update README.md** with your live URLs:
   ```markdown
   ## 🚀 Live Demo
   - **Frontend**: https://ecoscan.vercel.app
   - **Backend**: https://ecoscan-backend.onrender.com
   - **ML Service**: https://ecoscan-ml.onrender.com
   ```

2. **Commit and push**:
   ```bash
   git add README.md
   git commit -m "Update README with live demo links"
   git push
   ```

## 🎉 Success!

Your EcoScan application is now live! 🚀

### Your Live URLs:
- **Frontend**: https://ecoscan.vercel.app
- **Backend**: https://ecoscan-backend.onrender.com
- **ML Service**: https://ecoscan-ml.onrender.com

## 📝 Notes

- **Free Tier Limits**:
  - Vercel: Unlimited deployments, 100GB bandwidth/month
  - Render: 750 hours/month (free tier)
  - MongoDB Atlas: 512MB storage (free tier)
  - AWS S3: 5GB storage (first year free)

- **Auto-Deployment**: All services auto-deploy on push to `main` branch

- **Environment Variables**: Keep them secure, never commit to GitHub

## 🐛 Troubleshooting

### Frontend not loading?
- Check Vercel deployment logs
- Verify environment variables are set
- Check build errors in Vercel dashboard

### Backend not responding?
- Check Render service logs
- Verify AWS credentials
- Check ML service URL is correct

### ML service not working?
- Check Render service logs
- Verify model file is accessible
- Check Python dependencies

### Database connection issues?
- Verify MongoDB URI is correct
- Check IP whitelist in Atlas
- Verify database user credentials

## 🆘 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Check service logs in Vercel/Render dashboards
- Verify all environment variables are set correctly

---

**Happy Deploying! 🎉**

