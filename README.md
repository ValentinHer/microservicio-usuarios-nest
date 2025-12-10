# microservicio-usuarios-nest

Microservicio de usuarios desarrollado con NestJS + TypeScript.

## 📄 Descripción

Este servicio gestiona la lógica de usuarios: creación, manejo de datos de usuario, etc.  
Está pensado para ser una parte de una arquitectura de microservicios — ideal para integrarse con otros servicios en una arquitectura distribuida.  

## ⚙️ Requisitos

- Node.js 
- npm
- Docker / docker-compose — si vas a usar contenedores  
- Variables de entorno (.env) — copia `.env.example` como `.env` y configura según tu entorno  

## 🚀 Instalación & Ejecución

# Instalar dependencias
```bash
npm install
```

# Levantar BD PostgresSQL
```bash
docker compose up -d
```

# Parar BD PostgresSQL
```bash
docker compose down
```

# Para desarrollo
```bash
npm run start:dev
```

# Ejecutar test E2E
```bash
npm run test:e2e
```
