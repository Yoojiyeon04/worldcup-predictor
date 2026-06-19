param(
    [Parameter(Mandatory = $true)]
    [string]$StreamlitUrl
)

$ErrorActionPreference = "Stop"
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location (Split-Path $PSScriptRoot -Parent)

if ($StreamlitUrl -notmatch '^https://.+\.streamlit\.app/?$') {
    Write-Error "URL must look like https://your-app.streamlit.app"
}

$npx = "C:\Program Files\nodejs\npx.cmd"
foreach ($target in @("production", "preview", "development")) {
    $null = $StreamlitUrl | & $npx vercel env add STREAMLIT_APP_URL $target --force 2>&1
    Write-Host "Updated STREAMLIT_APP_URL ($target)"
}

& $npx vercel deploy --prod --yes
Write-Host "Done. Landing: https://worldcup-predictor-rosy.vercel.app"
