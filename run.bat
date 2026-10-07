@echo off
title TradeX - AI Trading Chart Analyzer
color 0A

echo ========================================================
echo          TradeX - AI Trading Chart Analyzer             
echo ========================================================
echo.

:: Ensure Node.js and Git are in PATH for this session
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin;%PATH%"

:: Navigate to project directory
cd /d "C:\Users\HP\.gemini\antigravity\scratch\tradex"

:: Verify Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js could not be found!
    echo Please verify %LOCALAPPDATA%\Programs\nodejs exists.
    pause
    exit /b 1
)

echo Starting Backend API (Port 3001)...
echo Starting Frontend UI (Port 5173)...
echo.
echo Opening browser at http://localhost:5173 ...
echo Press Ctrl+C in this window anytime to stop both servers.
echo ========================================================
echo.

:: Open default browser after 3 seconds
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Launch both backend and frontend servers
npm run dev

pause
