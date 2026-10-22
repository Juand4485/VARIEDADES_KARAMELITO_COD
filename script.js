const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const { promisify } = require('util');
const run = promisify(execFile);
const root = __dirname;
const logs = path.join(root, '_inicio');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function responds(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => { res.resume(); resolve(res.statusCode === 200); });
    req.setTimeout(2000, () => req.destroy());
    req.on('error', () => resolve(false));
  });
}
async function waitFor(url) {
  for (let i = 0; i < 90; i++) {
    if (await responds(url)) return;
    await delay(1000);
  }
  throw new Error('No responde ' + url + '. Revisa los registros de _inicio.');
}
function launch(file, args, cwd, name) {
  const out = fs.openSync(path.join(logs, name + '.log'), 'a');
  try {
    const child = spawn(file, args, { cwd, detached: true, windowsHide: true, stdio: ['ignore', out, out] });
    child.on('error', () => console.error('No se pudo iniciar ' + name));
    child.unref();
  } finally { fs.closeSync(out); }
}
async function main() {
  fs.mkdirSync(logs, { recursive: true });
  const pgRoot = path.join(process.env.ProgramFiles || 'C:/Program Files', 'PostgreSQL', '18');
  const pgCtl = path.join(pgRoot, 'bin', 'pg_ctl.exe');
  const pgReady = path.join(pgRoot, 'bin', 'pg_isready.exe');
  try { await run(pgReady, ['-h', 'localhost', '-p', '5432', '-t', '2'], { windowsHide: true }); }
  catch {
    console.log('Iniciando PostgreSQL 18...');
    try {
      await run(pgCtl, ['start', '-D', path.join(pgRoot, 'data'), '-w', '-t', '60', '-l', path.join(logs, 'postgresql.log')], { windowsHide: true });
    } catch {
      // Puede haber terminado el arranque mientras se esperaba.
      await run(pgReady, ['-h', 'localhost', '-p', '5432', '-t', '5'], { windowsHide: true });
    }
  }
  const { pool } = await import(pathToFileURL(path.join(root, 'Backend', 'src', 'config', 'database.js')).href);
  try { await pool.query('SELECT 1'); }
  finally { await pool.end(); }
  console.log('Base de datos conectada.');
  if (!await responds('http://localhost:5000/api/productos')) {
    launch(process.execPath, ['src/app.js'], path.join(root, 'Backend'), 'backend');
  }
  await waitFor('http://localhost:5000/api/productos');
  if (!await responds('http://localhost:3000')) {
    launch(process.execPath, [path.join(root, 'Frontend', 'node_modules', 'next', 'dist', 'bin', 'next'), 'dev', '--hostname', '127.0.0.1', '--port', '3000'], path.join(root, 'Frontend'), 'frontend');
  }
  await waitFor('http://localhost:3000');
  const browser = spawn('cmd.exe', ['/c', 'start', '', 'http://localhost:3000'], { windowsHide: true, detached: true, stdio: 'ignore' });
  browser.unref();
  console.log('Karamelito disponible en http://localhost:3000');
}
main().catch(error => {
  console.error('No se pudo iniciar Karamelito. Codigo:', error.code || 'INICIO', error.code ? '' : error.message);
  process.exitCode = 1;
});
