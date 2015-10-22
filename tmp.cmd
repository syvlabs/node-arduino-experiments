@echo off
node index.js
if errorlevel 1 (
   echo Failure Reason Given is %errorlevel%
   exit /b %errorlevel%
) else (
    echo Success
)
