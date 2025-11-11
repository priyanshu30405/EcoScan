# 🚀 Deploy EcoScan Frontend to Vercel

This is a simple guide to deploy your EcoScan frontend to Vercel in just a few minutes.

## Step 1: Sign up for Vercel (if you haven't)

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

## Step 2: Deploy Your Project

1. **After signing in, you'll see the Vercel dashboard**
2. **Click "Add New Project"** (or "Import Project")
3. **Import your repository**:
   - You should see `priyanshu30405/EcoScan` in the list
   - Click "Import" next to it
4. **Configure your project**:
   - **Framework Preset**: Should auto-detect "Next.js" ✅
   - **Root Directory**: Click "Edit" and set it to `Frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (default - keep it)
   - **Output Directory**: `.next` (default - keep it)
   - **Install Command**: `npm install` (default - keep it)
5. **Add Environment Variables** (Click "Environment Variables"):
   - Click "Add" for each variable:
   
   ```
   MONGODB_URI
   Value: your_mongodb_atlas_uri (or use: mongodb://localhost:27017/ecoscan for now)
   
   JWT_SECRET
   Value: any_random_string_like_this_is_my_secret_key_12345
   
   EMAIL_USER
   Value: your_email@gmail.com
   
   EMAIL_PASS
   Value: your_email_password
   
   GEMINI_API_KEY
   Value: your_gemini_api_key
   
   NEXT_PUBLIC_ML_URL
   Value: http://localhost:5001 (update this later after deploying ML service)
   
   NEXT_PUBLIC_BACKEND_URL
   Value: http://localhost:8080 (update this later after deploying backend)
   ```
   
   ⚠️ **Note**: You can update the ML and Backend URLs later after deploying those services.

6. **Click "Deploy"**
7. **Wait 2-3 minutes** for deployment to complete
8. **Your site will be live!** 🎉

## Step 3: Get Your Live URL

After deployment completes:
- You'll see a success message
- Your site URL will be displayed (e.g., `https://ecoscan-abc123.vercel.app`)
- Click on it to visit your live site!

## Step 4: Update GitHub README (Optional)

1. Go to your GitHub repository: https://github.com/priyanshu30405/EcoScan
2. Edit `README.md`
3. Update the live demo link:
   ```markdown
   ## 🚀 Live Demo
   - **Frontend**: https://your-vercel-url.vercel.app
   ```
4. Commit and push the changes

## ✅ That's It!

Your frontend is now live on Vercel! 

### What's Next?

1. **Deploy Backend to Render** (See QUICK_DEPLOY.md)
2. **Deploy ML Service to Render** (See QUICK_DEPLOY.md)
3. **Update environment variables** in Vercel with the new backend/ML URLs
4. **Test your live application**

## 🎯 Quick Tips

- **Auto-Deployment**: Every time you push to GitHub, Vercel will automatically redeploy
- **Custom Domain**: You can add a custom domain in Vercel settings
- **Environment Variables**: You can update them anytime in Vercel dashboard → Settings → Environment Variables
- **Deployment Logs**: Check deployment logs if something goes wrong

## 🐛 Troubleshooting

### Build Failed?
- Check the build logs in Vercel
- Make sure Root Directory is set to `Frontend`
- Verify all dependencies are in `package.json`

### Site Not Loading?
- Check deployment logs
- Verify environment variables are set
- Check browser console for errors

### Need Help?
- Check Vercel documentation: https://vercel.com/docs
- Check deployment logs in Vercel dashboard
- See QUICK_DEPLOY.md for more details

---

**Congratulations! Your EcoScan frontend is now live! 🎉**

