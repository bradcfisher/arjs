@ECHO OFF
SETLOCAL EnableDelayedExpansion
SET NODE_DIR=
SET PREFIX=%~dp0\..\.gradle\nodejs
FOR /f %%i IN ('dir /b "%PREFIX%\node-v*" 2^> NUL') DO SET NODE_DIR=%PREFIX%\%%i
IF "%NODE_DIR%" == "" (
  "%~dp0\..\gradlew" setupNodeTools

  FOR /f %%i IN ('dir /b "%PREFIX%\node-v*" 2^> NUL') DO SET NODE_DIR=%PREFIX%\%%i

  IF "%NODE_DIR%" == "" (
    echo Unable to find local Node.js installation 1>&2
    EXIT /B 1
  )
)

echo %NODE_DIR%