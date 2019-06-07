@ECHO OFF
SETLOCAL EnableDelayedExpansion
FOR /f %%i IN ('"%~dp0\node-dir.bat" 2^> NUL') DO SET NODE=%%i\node
"%NODE%" %*