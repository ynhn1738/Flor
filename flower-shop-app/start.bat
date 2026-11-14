@echo off
rem Flơr: start the local app and open it in the browser.
rem First run asks for your Cloudflare API token and saves it in .env next to this file.
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
set CF_ACCOUNT_ID=476febd9c90853e6db2890529eaf8f96

findstr /b "CF_API_TOKEN=" .env >nul 2>&1
if errorlevel 1 (
  echo.
  echo Paste your Cloudflare API token and press Enter.
  echo ^(Leave empty to use lower-quality Pollinations images.^)
  set /p CF_API_TOKEN=Token:
)
if defined CF_API_TOKEN (
  >>.env echo CF_API_TOKEN=%CF_API_TOKEN%
  echo Token saved to .env - keep this file private.
)

start "" http://localhost:8080
python server.py
pause
