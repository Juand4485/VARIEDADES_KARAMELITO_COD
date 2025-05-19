@REM @echo off
@REM echo Iniciando backend...
@REM start /min cmd /k "cd C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Backend && npm run dev" &

@REM timeout /t 3 >nul

@REM echo Iniciando frontend...
@REM start /min cmd /k "cd C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Frontend && npm run start" &

@REM timeout /t 5 >nul

@REM echo Abriendo navegador en http://localhost:3000
@REM start http://localhost:3000

@REM exit


@echo off
echo Iniciando backend...
start "" /min /D "C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Backend" cmd /c "npm run start"

timeout /t 3 > nul

echo Iniciando frontend...
start "" /min /D "C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Frontend" cmd /c "npm run start"

echo Backend y frontend ejecutándose en segundo plano.

