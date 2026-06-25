<#
.SYNOPSIS
    TekTariq PM — One-Click Deploy Script
.DESCRIPTION
    Builds and deploys all services using Docker Compose.
    Usage: .\scripts\deploy.ps1
#>

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host "🚀 TekTariq PM — One-Click Deploy" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

Write-Host "1. Checking prerequisites..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if (-not $dockerVersion) {
    Write-Error "Docker is not installed. Please install Docker Desktop first."
    exit 1
}
Write-Host "   ✅ Docker: $dockerVersion" -ForegroundColor Green

$hasDotEnv = Test-Path "$rootDir\.env"
if (-not $hasDotEnv) {
    Write-Host "2. Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "$rootDir\.env.example" "$rootDir\.env"
    
    # Generate JWT secret
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
    $content = Get-Content "$rootDir\.env" -Raw
    $content = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
    Set-Content "$rootDir\.env" $content
    
    [System.Environment]::SetEnvironmentVariable("JWT_SECRET", $jwtSecret, "Process")
    Write-Host "   ✅ JWT secret generated" -ForegroundColor Green
}

Write-Host "3. Loading environment variables..." -ForegroundColor Yellow
Get-Content "$rootDir\.env" | ForEach-Object {
    if ($_ -match '^\s*([^#].*?)\s*=\s*(.*)') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}
Write-Host "   ✅ Environment loaded" -ForegroundColor Green

Write-Host "4. Building and starting all services..." -ForegroundColor Yellow
Set-Location $rootDir
docker compose build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Check the output above for errors."
    exit 1
}

docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start services."
    exit 1
}

Write-Host "`n5. Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n✅ Deploy complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "API:       http://localhost:4000/api/v1" -ForegroundColor Cyan
Write-Host "Database:  postgresql://tektariq:16-10Ac030@localhost:5432/tektariq_pm" -ForegroundColor Cyan
Write-Host "Redis:     redis://localhost:6379" -ForegroundColor Cyan
Write-Host "MinIO:     http://localhost:9000" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Green
Write-Host "Default login credentials:" -ForegroundColor Yellow
Write-Host "  Email:    superadmin@tektariq.com" -ForegroundColor White
Write-Host "  Password: TeKtArIq2024!" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
Write-Host "To stop:   docker compose down" -ForegroundColor Gray
Write-Host "To view logs: docker compose logs -f" -ForegroundColor Gray
