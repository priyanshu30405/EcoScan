$ErrorActionPreference = "Stop"

Write-Host "[EcoScan] Creating environment files..." -ForegroundColor Cyan

# Frontend .env.local
$frontendEnv = @(
  "MONGODB_URI=mongodb://localhost:27017/ecoscan",
  "JWT_SECRET=dev_secret",
  "EMAIL_USER=dev",
  "EMAIL_PASS=dev",
  "GEMINI_API_KEY=dev"
)
$frontendPath = Join-Path $PSScriptRoot "..\Frontend\.env.local"
$frontendEnv | Set-Content -NoNewline:$false -Path $frontendPath -Encoding UTF8
Write-Host "  - Wrote Frontend/.env.local" -ForegroundColor Green

# Backend .env
$backendEnv = @(
  "AWS_REGION=us-east-1",
  "AWS_ACCESS_KEY_ID=dev",
  "AWS_SECRET_ACCESS_KEY=dev",
  "S3_BUCKET_NAME=dev-bucket",
  "GEMINI_API_KEY=dev",
  "FLASK_SERVER_URL=http://localhost:5001",
  "PORT=8080"
)
$backendPath = Join-Path $PSScriptRoot "..\Backend\.env"
$backendEnv | Set-Content -NoNewline:$false -Path $backendPath -Encoding UTF8
Write-Host "  - Wrote Backend/.env" -ForegroundColor Green

Write-Host "[EcoScan] Installing Frontend dependencies..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "..\Frontend")
if (Test-Path package-lock.json) {
  npm ci
} else {
  npm install
}
Pop-Location

Write-Host "[EcoScan] Preparing Python venv and installing ML dependencies..." -ForegroundColor Cyan
$mlDir = Join-Path $PSScriptRoot "..\ml"
Push-Location $mlDir
if (-not (Test-Path ".venv")) {
  py -3.10 -m venv .venv
}
& .\.venv\Scripts\pip.exe install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt
Pop-Location

Write-Host "[EcoScan] Downloading Go modules..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "..\Backend")
if (Get-Command go -ErrorAction SilentlyContinue) {
    go mod download
    Write-Host "  - Go modules downloaded" -ForegroundColor Green
} else {
    Write-Host "  - Go not found. Skipping Go modules. Install Go 1.21+ to run backend." -ForegroundColor Yellow
}
Pop-Location

Write-Host "[EcoScan] Setup complete." -ForegroundColor Green


