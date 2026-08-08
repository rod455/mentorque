# Gera o .aab de release do Mentorque (Windows / PowerShell).
#
#   cd C:\Apps\Mentorque
#   .\scripts\release-android.ps1
#
# Antes do primeiro uso, crie android\keystore.properties (ver
# android\README-BUILD.md). Sem ele o pacote sai NÃO assinado e a Play recusa.
#
# O número da versão vem de mentorqueVersionCode em android\gradle.properties —
# incremente a cada envio, ou passe -VersionCode aqui.

param(
    [int]$VersionCode = 0,          # 0 = usa o valor de gradle.properties
    [switch]$SkipInstall            # pula npm install quando nada mudou
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

Step "Atualizando a main"
git pull origin main

if (-not $SkipInstall) {
    Step "Dependências"
    npm install
}

Step "Sincronizando o projeto Capacitor"
# Gera android\capacitor-cordova-android-plugins\, que não vai para o git.
npx cap sync android

$keystore = Join-Path $repo "android\keystore.properties"
if (-not (Test-Path $keystore)) {
    Write-Host "`nATENÇÃO: android\keystore.properties não existe." -ForegroundColor Yellow
    Write-Host "O .aab vai sair NÃO assinado e a Play vai recusar." -ForegroundColor Yellow
    Write-Host "Veja android\README-BUILD.md. Ctrl+C para abortar." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Step "Compilando o .aab"
Set-Location (Join-Path $repo "android")
$gradleArgs = @("clean", "bundleRelease")
if ($VersionCode -gt 0) { $gradleArgs += "-PmentorqueVersionCode=$VersionCode" }
& .\gradlew.bat @gradleArgs
if ($LASTEXITCODE -ne 0) { throw "Build falhou (código $LASTEXITCODE)" }

Set-Location $repo
$aab = Join-Path $repo "android\app\build\outputs\bundle\release\app-release.aab"
$mapping = Join-Path $repo "android\app\build\outputs\mapping\release\mapping.txt"

Step "Pronto"
if (Test-Path $aab) {
    $size = [math]::Round((Get-Item $aab).Length / 1MB, 1)
    Write-Host "  .aab      $aab  ($size MB)" -ForegroundColor Green
} else {
    throw "O .aab não foi encontrado em $aab"
}
if (Test-Path $mapping) {
    Write-Host "  mapping   $mapping" -ForegroundColor Green
    Write-Host "            (suba junto com o .aab: desofusca os stack traces do R8)"
}

# O versionCode que realmente entrou no pacote. Confira antes de subir — um
# código repetido é recusado no upload, mesmo que a versão anterior tenha
# sido reprovada.
$effective = if ($VersionCode -gt 0) { $VersionCode } else {
    (Select-String -Path "android\gradle.properties" -Pattern '^mentorqueVersionCode=(\d+)').Matches.Groups[1].Value
}
Write-Host "`n  versionCode deste pacote: $effective" -ForegroundColor Yellow
Write-Host "  Confirme em Build -> Analyze APK... -> AndroidManifest.xml antes de subir."
