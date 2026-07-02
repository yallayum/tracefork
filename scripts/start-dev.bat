@echo off
REM TraceFork — start API + Web (Windows)
cd /d %~dp0..
start "TraceFork API" cmd /k ".venv\Scripts\python -m api.server"
timeout /t 2 /nobreak >nul
cd web-app
npm run dev
