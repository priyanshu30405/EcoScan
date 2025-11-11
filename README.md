#  EcoScan - Smart Sustainability Analysis 🔍🌱

> "Transform your waste into opportunities. With EcoScan, discover intelligent ways to recycle, reuse, and resell your products."

## 🧠 Introduction

EcoScan is a comprehensive sustainability analysis platform that helps users make informed decisions about product lifecycle management. By analyzing product images, our platform provides detailed insights into how you can extend a product's life through three key sustainability pillars: reuse, recycle, and resale. Whether you're looking to dispose of items responsibly or make sustainable purchasing decisions, EcoScan guides you towards environmentally conscious choices.



## 🔍 Problem Statement

In today's consumer-driven world, we face several critical challenges:
- Lack of awareness about proper product disposal methods
- Difficulty in identifying recycling and reuse opportunities
- Limited access to local sustainability resources
- Environmental impact of improper product disposal
- Complex decision-making process for sustainable product lifecycle management



## ✅ Solution Overview

EcoScan addresses these challenges through:

### 1. Image-Based Analysis
- **Smart Capture**: Take photos or upload product images
- **Material Recognition**: Advanced ML models identify product composition
- **Lifecycle Analysis**: Get detailed insights on:
  - Reuse potential and creative repurposing ideas
  - Recycling options and local facilities
  - Resale value and market opportunities
  - Biodegradability assessment

### 2. Browser Extension
- **Quick Analysis**: Get instant sustainability insights while browsing
- **Seamless Integration**: Works alongside your browsing experience
- **Consistent Experience**: Same analysis quality as the web platform
- **Easy Access**: One-click access to detailed sustainability information

### 3. Community Forum
- Share sustainability experiences
- Discuss eco-friendly practices
- Create and participate in polls
- Share images and tips
- Connect with like-minded individuals



### 🛠️ Tech Stack

| Category      | Technologies                                                                 |
|---------------|-------------------------------------------------------------------------------|
| **Frontend**  | Next.js 15.2.4, React 19, TypeScript, TailwindCSS, Framer Motion, Three.js    |
| **Backend**   | Go (Golang), Gin Web Framework, AWS S3, MongoDB                               |
| **Extension** | JavaScript, Chrome Extension Manifest V3, Content Scripts                     |
| **ML Component** | Python, Computer Vision Models, Flask Server                               |



## 🧩 Architecture

![PHOTO-2025-04-12-10-45-59](https://github.com/user-attachments/assets/b7fae772-8371-4276-b5a1-8c14538af0f0)





## ☘️ Installation

### Prerequisites
- Node.js 18+
- Go 1.21+
- Python 3.10 or further
- Chrome/Edge browser
- AWS account
- MongoDB

### Quick Start (Using Scripts - Recommended)

**For Windows (PowerShell):**

1. Clone the repository:
```bash
git clone https://github.com/priyanshu30405/EcoScan.git
cd EcoScan
```

2. Run setup script:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\setup-dev.ps1"
```

3. Start all services:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\start-all.ps1"
```

This will start:
- ML Server (Flask) on port 5001
- Backend (Go) on port 8080 (if Go is installed)
- Frontend (Next.js) on port 3000

4. Open your browser and navigate to: `http://localhost:3000`

### Manual Setup

#### Run Frontend
```bash
cd Frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:3000`

#### Run Backend 
```bash
cd Backend
go mod download
go run main.go
```
Backend will be available at: `http://localhost:8080`

#### Run ML model
```bash
cd ml
py -3.10 -m venv .venv
.venv\Scripts\activate  # For Windows
# OR
source .venv/bin/activate  # For macOS/Linux
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```
ML Server will be available at: `http://localhost:5001`

**Note:** For macOS ARM, remove `tensorflow-intel==2.18.0` from requirements.txt

#### Extension Setup
1. Open Chrome/Edge
2. Go to Extensions page (`chrome://extensions/` or `edge://extensions/`)
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the `3R_Chrome_Extension` directory

### Environment Variables
Create `.env` files in respective directories:

#### Frontend (Frontend/.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/ecoscan
JWT_SECRET=your_secret_key_for_JWT_tokens
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
GEMINI_API_KEY=your_gemini_api_key
```

#### Backend (Backend/.env)
```env
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_bucket_name
GEMINI_API_KEY=your_gemini_api_key
FLASK_SERVER_URL=http://localhost:5001
PORT=8080
```

**Note:** The setup script (`scripts/setup-dev.ps1`) automatically creates these files with default values for development.

#### Frontend Environment Variables (for deployment)
```env
NEXT_PUBLIC_ML_URL=https://your-ml-service.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

## 🚀 Deployment

### Quick Start Deployment
👉 **See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for step-by-step deployment guide (Recommended)**

### Detailed Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Deployment Options:

1. **Frontend (Vercel)**: 
   - Connect GitHub repo → Set Root Directory to `Frontend` → Deploy
   - Auto-deploys on every push to `main` branch
   
2. **Backend (Render)**: 
   - Use `render.yaml` for automatic deployment
   - Or manually create Web Service with Go runtime
   
3. **ML Service (Render)**: 
   - Use `render.yaml` for automatic deployment
   - Or manually create Web Service with Python runtime

## 📸 Screenshots

![EcoScan Homepage](https://github.com/priyanshu30405/EcoScan/blob/main/images/screenshot.png)

## 🚀 Features

- **AI-Powered Analysis**: Advanced ML models for waste classification
- **Sustainability Insights**: Detailed recycling, reuse, and resale recommendations
- **Browser Extension**: Quick analysis while browsing
- **Community Forum**: Share experiences and connect with like-minded users
- **Real-time Analysis**: Instant results with high accuracy
- **Carbon Footprint Tracking**: Understand environmental impact

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🔗 Links

- **GitHub Repository**: [priyanshu30405/EcoScan](https://github.com/priyanshu30405/EcoScan)
- **Live Demo**: [ecoscan.vercel.app](https://ecoscan.vercel.app) (Coming soon)
- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide

## 👥 Author

**Priyanshu Raj**

Developer and Creator of EcoScan

- **Email:** priyanshuraj30405@gmail.com
- **GitHub:** [@priyanshu30405](https://github.com/priyanshu30405)
- **LinkedIn:** [Priyanshu Raj](https://www.linkedin.com/in/priyanshu-raj-0b4a9624b/)

## 🙏 Acknowledgments

- TensorFlow for ML models
- Google Gemini API for AI analysis
- React and Next.js communities
- All contributors and users of EcoScan
