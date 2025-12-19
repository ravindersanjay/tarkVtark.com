# Apply Guidelines Migration - PowerShell Version
# Run this if psql command doesn't work directly

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Applying Guidelines Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "postgres"
$dbName = "debate_arena"
$user = "postgres"
$sqlFile = "database-migration-guidelines.sql"

Write-Host "Connecting to database: $dbName" -ForegroundColor Yellow
Write-Host "User: $user" -ForegroundColor Yellow
Write-Host ""

try {
    psql -U $user -d $dbName -f $sqlFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host " Migration Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Guidelines table has been created." -ForegroundColor Green
        Write-Host "You can now start the backend." -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host " Migration Failed!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check the error messages above." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "Error running migration: $_" -ForegroundColor Red
    Write-Host ""
}

Remove-Item Env:\PGPASSWORD

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

