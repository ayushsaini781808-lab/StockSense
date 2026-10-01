@'
@echo off
cd /d "%~dp0"
start "ML Service" cmd /k "cd ml-service && pip install -r requirements.txt && python app.py"
start "Node Server" cmd /k "npm install && npm start"
timeout /t 10 >nul
start http://localhost:3000
'@ | Set-Content -Encoding ASCII start.bat