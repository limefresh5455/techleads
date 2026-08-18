# Create techleads database on local PostgreSQL 14 (port 5433)
$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
if (-not (Test-Path $psql)) {
    Write-Error "PostgreSQL 14 not found at $psql"
}

$pgPassword = $env:POSTGRES_PASSWORD
if (-not $pgPassword) { $pgPassword = "postgres" }
$env:PGPASSWORD = $pgPassword

Write-Host "Creating role and database on PostgreSQL 14 (port 5433)..."
& $psql -U postgres -h localhost -p 5433 -v ON_ERROR_STOP=1 -c @"
DO `$`$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'techleads') THEN
    CREATE ROLE techleads WITH LOGIN PASSWORD 'techleads';
  END IF;
END `$`$;
"@

$dbExists = & $psql -U postgres -h localhost -p 5433 -tAc "SELECT 1 FROM pg_database WHERE datname = 'techleads'"
if (-not ($dbExists -match "1")) {
    & $psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE techleads OWNER techleads;"
}
& $psql -U postgres -h localhost -p 5433 -c "GRANT ALL PRIVILEGES ON DATABASE techleads TO techleads;"

Write-Host "Database ready: postgresql://techleads:techleads@localhost:5433/techleads"
