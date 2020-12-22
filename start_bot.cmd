@ECHO OFF
title Bionic Bot

start /wait cmd /c .\start_npm_install.cmd

:start_bot
node --trace-warnings .\index.js
timeout /T 5 /NOBREAK
goto :start_bot

pause