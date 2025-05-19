Set WshShell = CreateObject("WScript.Shell")

' Ejecutar backend
WshShell.Run "cmd.exe /c cd /d C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Backend && npm run start", 0, False

WScript.Sleep 3000 ' Esperar 3 segundos

' Ejecutar frontend
WshShell.Run "cmd.exe /c cd /d C:\Users\USUARIO\Desktop\VARIEDADES_KARAMELITO_COD\Frontend && npm run start", 0, False

WScript.Sleep 3000 ' Esperar 3 segundos adicionales

' Abrir navegador en localhost:3000
WshShell.Run "http://localhost:3000", 0, False

