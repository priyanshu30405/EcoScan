# How to Create a GitHub Personal Access Token

## Step-by-Step Guide

### Step 1: Navigate to Developer Settings

**Method 1: Through Profile Settings**
1. Click your profile picture in the top-right corner of GitHub
2. Click **"Settings"**
3. Scroll down in the left sidebar
4. Click **"Developer settings"** (at the bottom of the list)

**Method 2: Direct Link**
- Go directly to: https://github.com/settings/tokens

### Step 2: Create a New Token

1. In Developer settings, click **"Personal access tokens"**
2. Click **"Tokens (classic)"**
3. Click **"Generate new token"** button
4. Select **"Generate new token (classic)"**

### Step 3: Configure the Token

1. **Note**: Give it a name like `EcoScan Push` or `EcoScan Repository Access`
2. **Expiration**: Choose an expiration (30 days, 60 days, 90 days, or no expiration)
3. **Select scopes**: Check the **`repo`** checkbox
   - This gives full control of private repositories
   - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
4. Scroll down and click **"Generate token"**

### Step 4: Copy the Token

1. **IMPORTANT**: Copy the token immediately!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again after you leave this page
2. Save it securely (password manager, notes app, etc.)

### Step 5: Use the Token to Push

1. Open your terminal/command prompt
2. Navigate to your project:
   ```bash
   cd "C:\Users\Priyanshu Raj\Downloads\3RVision-main\3RVision-main"
   ```
3. Push to GitHub:
   ```bash
   git push -u origin main
   ```
4. When prompted:
   - **Username**: Enter `priyanshu30405`
   - **Password**: Paste your Personal Access Token (NOT your GitHub password)

## Visual Guide

```
GitHub Homepage
    ↓
Click Profile Picture (top-right)
    ↓
Settings
    ↓
Scroll Down → Developer settings
    ↓
Personal access tokens
    ↓
Tokens (classic)
    ↓
Generate new token (classic)
    ↓
Configure (Name, Expiration, Scopes: repo)
    ↓
Generate token
    ↓
Copy token (save it!)
```

## Troubleshooting

### Can't find Developer settings?
- Make sure you're logged into GitHub
- Look at the very bottom of the Settings sidebar
- It might be under "Access" section in some GitHub versions

### Token not working?
- Make sure you selected the `repo` scope
- Check if the token has expired
- Try creating a new token
- Make sure you're using the token as the password, not your GitHub password

### Still having issues?
- Try using GitHub Desktop instead
- Or use SSH keys for authentication
- Check GitHub's documentation: https://docs.github.com/en/authentication

## Security Tips

1. **Don't share your token** with anyone
2. **Use environment variables** if using in scripts
3. **Revoke old tokens** if you suspect compromise
4. **Set expiration dates** for tokens
5. **Use fine-grained tokens** for production (if available)

## Alternative: GitHub Desktop

If creating tokens seems complicated, you can use GitHub Desktop:
1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. It handles authentication automatically
4. Just click "Publish repository" button

