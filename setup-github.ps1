# GitHub 연동 스크립트 (로그인 후 실행)
# 사용법: powershell -ExecutionPolicy Bypass -File setup-github.ps1

$git = "C:\Program Files\Git\cmd\git.exe"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repoName = "worldcup-predictor"

Set-Location $PSScriptRoot

Write-Host "=== GitHub 로그인 확인 ===" -ForegroundColor Cyan
& $gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "먼저 로그인하세요: gh auth login --web" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== GitHub 저장소 생성 및 푸시 ===" -ForegroundColor Cyan
& $gh repo create $repoName --public --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
    $url = & $gh repo view --json url -q .url
    Write-Host "`n완료! 저장소: $url" -ForegroundColor Green
} else {
    Write-Host "`n저장소가 이미 있으면 수동 연동:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$repoName.git"
    Write-Host "  git branch -M main"
    Write-Host "  git push -u origin main"
}
