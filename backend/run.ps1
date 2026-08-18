# Run the TechLeads API using the project virtualenv (not system Python).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating virtualenv..."
    python -m venv .venv
}

Write-Host "Installing dependencies..."
.\.venv\Scripts\pip.exe install -r requirements.txt -q

Write-Host "Starting API on http://127.0.0.1:8000"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
