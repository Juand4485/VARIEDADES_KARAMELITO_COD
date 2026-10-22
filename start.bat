@echo off
cd /d "%~dp0"
node "%~dp0script.js"
if errorlevel 1 pause
