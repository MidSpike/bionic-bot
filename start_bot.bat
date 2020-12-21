@ECHO OFF
title Bionic Bot

:start_bot
node --trace-warnings .\index.js
timeout /T 5 /NOBREAK
goto :start_bot

pause
