# Variedades Karamelito

Aplicación local de inventario y ventas para una miscelánea. Incluye consulta de productos, existencias, registro de ventas y un panel de estadísticas.

## Tecnologías

- Interfaz: Next.js 15, React 19, TypeScript y Tailwind CSS.
- Servidor: Node.js, Express y JavaScript con módulos ES.
- Base de datos: PostgreSQL. Conexión local comprobada con PostgreSQL 18.

## Organización

- `Frontend/`: pantallas y comunicación con la API.
- `Backend/src/`: rutas, controladores, modelos y conexión a PostgreSQL.
- `Backend/.env.example`: ejemplo de configuración sin contraseña.
- `start.bat`: inicio local para Windows.
- `start.vbs`: inicia el mismo proceso sin ventana de consola.
- `script.js`: comprueba la conexión e inicia los servidores.

## Preparación local

1. Instala Node.js con npm y PostgreSQL.
2. Instala las dependencias dentro de `Backend` con `npm ci`.
3. Instala las dependencias dentro de `Frontend` con `npm ci --legacy-peer-deps` (el proyecto utiliza React 19 y algunas dependencias antiguas declaran versiones previas).
4. Copia `Backend/.env.example` como `Backend/.env` y completa la contraseña en tu computador.
5. Necesitas una base PostgreSQL compatible con las tablas `producto`, `venta` y `detalleventa`. La base, sus registros y sus respaldos se gestionan por separado y no se incluyen en este repositorio.

## Abrir en Windows

Haz doble clic en `start.bat`. El iniciador utiliza la ubicación de la carpeta, comprueba PostgreSQL 18 y abre `http://localhost:3000`.

- Interfaz: `http://localhost:3000`.
- API: `http://localhost:5000/api`.
- Registros del inicio: `_inicio/`, solo en el equipo local.

El iniciador espera PostgreSQL 18 en la ruta de instalación habitual de Windows y el puerto 5432. Inicia la interfaz en modo de desarrollo; la primera carga de cada pantalla puede tardar mientras se compila.

También puedes iniciar manualmente con `npm start` dentro de `Backend` y `npm run dev` dentro de `Frontend`, una vez que PostgreSQL esté activo.

## Configuración privada

La contraseña se lee de `Backend/.env`. Ese archivo está excluido mediante `.gitignore`. El repositorio tampoco incluye dependencias instaladas, archivos generados, registros, volcados de la base ni respaldos locales.

Si una contraseña se publicó en versiones antiguas, retirarla del archivo actual no la elimina del historial: se debe cambiar esa contraseña antes de reutilizarla en un entorno sensible.

## Alcance de la comprobación

Se comprobó la conexión a PostgreSQL y la lectura de inventario, ventas y estadísticas en el entorno local. Esto no equivale a una auditoría completa de las operaciones de escritura. La aplicación necesita revisión adicional antes de exponerse a Internet, especialmente en autenticación y validación de operaciones.
