@echo off
start app.exe
timeout /t 3 >nul
start http://127.0.0.1:5000
