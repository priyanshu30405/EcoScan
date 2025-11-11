$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$mlDir = Join-Path $root "ml"
$backendDir = Join-Path $root "Backend"
$frontendDir = Join-Path $root "Frontend"
$mlPython = Join-Path $mlDir ".venv\Scripts\python.exe"
$mlApp = Join-Path $mlDir "app.py"

Write-Host "[EcoScan] Starting ML (Flask) on :5001 ..." -ForegroundColor Cyan
if (Test-Path $mlPython) {
    $mlCmd = "Set-Location '$mlDir'; & '$mlPython' app.py"
    Start-Process powershell -ArgumentList "-NoExit","-Command",$mlCmd | Out-Null
} else {
    $mlCmd = "Set-Location '$mlDir'; py -3.10 app.py"
    Start-Process powershell -ArgumentList "-NoExit","-Command",$mlCmd | Out-Null
}

Start-Sleep -Seconds 2

Write-Host "[EcoScan] Starting Backend (Go) on :8080 ..." -ForegroundColor Cyan
if (Get-Command go -ErrorAction SilentlyContinue) {
    $backendCmd = "Set-Location '$backendDir'; go run main.go"
    Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd | Out-Null
} else {
    Write-Host "  - Go not found. Skipping backend. Install Go 1.21+ to run backend." -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

Write-Host "[EcoScan] Starting Frontend (Next.js) on :3000 ..." -ForegroundColor Cyan
$frontendCmd = "Set-Location '$frontendDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd | Out-Null

Write-Host "[EcoScan] All services launched in separate terminals." -ForegroundColor Green


