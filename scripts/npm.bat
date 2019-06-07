@ECHO OFF
SETLOCAL EnableDelayedExpansion
FOR /f %%i IN ('"%~dp0\node-dir.bat" 2^> NUL') DO SET NPM=%%i\npm
"%NPM%" %*