# Express PostgreSQL App

Este proyecto es una aplicación web construida con Express y TypeScript, que se conecta a una base de datos PostgreSQL 17. A continuación se describen los componentes principales del proyecto.

## Estructura del Proyecto

```
express-postgresql-app
├── src
│   ├── app.ts               # Punto de entrada de la aplicación
│   ├── config
│   │   └── database.ts      # Configuración de la conexión a PostgreSQL
│   ├── controllers
│   │   └── index.ts         # Controladores para manejar las rutas
│   ├── routes
│   │   └── index.ts         # Configuración de las rutas de la aplicación
│   └── types
│       └── index.ts         # Tipos personalizados para las solicitudes y respuestas
├── package.json              # Configuración de npm y dependencias
├── tsconfig.json             # Configuración de TypeScript
└── README.md                 # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd express-postgresql-app
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura la conexión a la base de datos en `src/config/database.ts`.

## Uso

Para iniciar la aplicación, ejecuta el siguiente comando:

```
npm start
```

La aplicación se ejecutará en `http://localhost:3000`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.