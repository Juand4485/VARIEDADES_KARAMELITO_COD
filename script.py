import subprocess
import os
import time

# Rutas a los directorios del backend y frontend
backend_path = os.path.abspath("C:/Users/USUARIO/Desktop/VARIEDADES_KARAMELITO_COD/Backend")  # Reemplaza con la ruta real
frontend_path = os.path.abspath("C:/Users/USUARIO/Desktop/VARIEDADES_KARAMELITO_COD/Frontend")  # Reemplaza con la ruta real

# Comandos para ejecutar
backend_cmd = [r"C:/Program Files/nodejs/npm.cmd", "run", "start"]  # o el comando que uses para iniciar el backend
frontend_cmd = [r"C:/Program Files/nodejs/npm.cmd", "run", "start"]  # o el comando para el frontend

# Ejecutar el backend en segundo plano
print("Iniciando backend...")
backend_process = subprocess.Popen(backend_cmd, cwd=backend_path, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Esperar unos segundos para que el backend arranque antes de iniciar el frontend (opcional)
time.sleep(3)

# Ejecutar el frontend en segundo plano
print("Iniciando frontend...")
frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_path, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Backend y frontend ejecutándose en segundo plano.")

# Si deseas que el script siga corriendo mientras los procesos están activos:
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Deteniendo procesos...")
    backend_process.terminate()
    frontend_process.terminate()
