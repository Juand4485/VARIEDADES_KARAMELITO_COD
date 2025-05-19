const { spawn } = require('child_process');
const path = require('path');

// Función para lanzar procesos ocultos
function runCommand(command, cwd) {
  const proc = spawn(command, {
    cwd,
    detached: true,
    stdio: 'ignore', // Oculta salida
    shell: true      // Necesario para que Windows interprete "npm run"
  });

  proc.on('error', (err) => {
    console.error(`Error al ejecutar el comando: ${err}`);
  });

  proc.unref(); // Desvincula el proceso para que no bloquee el script
}

// Rutas a los proyectos
const backendPath = path.resolve('C:/Users/USUARIO/Desktop/VARIEDADES_KARAMELITO_COD/Backend');
const frontendPath = path.resolve('C:/Users/USUARIO/Desktop/VARIEDADES_KARAMELITO_COD/Frontend');

// Iniciar backend
console.log('Iniciando backend...');
runCommand('npm run start', backendPath);

// Iniciar frontend después de un delay
setTimeout(() => {
  console.log('Iniciando frontend...');
  runCommand('npm run start', frontendPath);
}, 3000);
