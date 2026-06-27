<#
.SYNOPSIS
    TekTariq PM — One-Click Deploy Script
.DESCRIPTION
    Builds and deploys all services using Docker Compose.
    Usage: .\scripts\deploy.ps1
#>

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TekTariq PM — Deploy Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootDir

Write-Host "1. Checking prerequisites..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if (-not $dockerVersion) {
    Write-Error "Docker is not installed. Install Docker Desktop first."
    exit 1
}
Write-Host "   Docker: $dockerVersion" -ForegroundColor Green

Write-Host ""
Write-Host "2. Updating code from Git..." -ForegroundColor Yellow
if (git --version 2>$null) {
    git pull
    Write-Host "   Code updated." -ForegroundColor Green
} else {
    Write-Host "   Git not available — skipping pull." -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Configuring environment..." -ForegroundColor Yellow
$hasDotEnv = Test-Path "$rootDir\.env"
if (-not $hasDotEnv) {
    Copy-Item "$rootDir\.env.example" "$rootDir\.env"
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
    $content = Get-Content "$rootDir\.env" -Raw
    $content = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
    Set-Content "$rootDir\.env" $content
    Write-Host "   .env created with random JWT secret." -ForegroundColor Green
} else {
    Write-Host "   .env already exists — keeping existing." -ForegroundColor Gray
}

Get-Content "$rootDir\.env" | ForEach-Object {
    if ($_ -match '^\s*([^#].*?)\s*=\s*(.*)') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

Write-Host ""
Write-Host "4. Building and starting services..." -ForegroundColor Yellow
$composeFiles = "-f docker-compose.yml"
if ($env:DOMAIN) {
    $composeFiles += " -f docker-compose.prod.yml"
    Write-Host "   Production mode (DOMAIN=$($env:DOMAIN))" -ForegroundColor Green
}

docker compose $composeFiles build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit 1
}

docker compose $composeFiles up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start services."
    exit 1
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
if ($env:DOMAIN) {
    Write-Host "  Frontend:  https://$($env:DOMAIN)" -ForegroundColor Cyan
    Write-Host "  API:       https://$($env:DOMAIN)/api" -ForegroundColor Cyan
    Write-Host "  MinIO:     https://console.$($env:DOMAIN)" -ForegroundColor Cyan
} else {
    Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  API:       http://localhost:4000/api/v1" -ForegroundColor Cyan
}
Write-Host "  DB:        postgresql://tektariq:16-10Ac030@localhost:5432/tektariq_pm" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login:     superadmin@tektariq.com / TeKtArIq2024!" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Stop:      docker compose down" -ForegroundColor Gray
Write-Host "  Logs:      docker compose logs -f" -ForegroundColor Gray
Write-Host "==============================================" -ForegroundColor Green
