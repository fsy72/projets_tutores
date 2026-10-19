$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()

# --- Fonction utilitaire : execute une commande et arrete si erreur ---
function Invoke-Step {
    param(
        [string]$Description,
        [scriptblock]$Command
    )
    Write-Host "`n$Description..." -ForegroundColor Cyan
    try {
        & $Command
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
            throw "Commande terminee avec le code $LASTEXITCODE"
        }
    }
    catch {
        Write-Host "ERREUR : $_" -ForegroundColor Red
        return
    }
}

Invoke-Step "Spring Boot" { mvn clean spring-boot:run }