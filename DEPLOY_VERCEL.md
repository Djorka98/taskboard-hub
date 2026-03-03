# Deploy en Vercel (Frontend + Backend)

Este repo es monorepo `pnpm`, así que se recomienda crear **2 proyectos** en Vercel:

- `nexus-web` (root: `apps/web`)
- `nexus-api` (root: `apps/api`)

## 1) Backend (`apps/api`)

### Archivos ya preparados

- `apps/api/vercel.json`
- `apps/api/api/index.ts` (entrypoint serverless para Express)

### Variables de entorno en Vercel

Configura estas variables en el proyecto `nexus-api`:

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://TU_FRONTEND_URL`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...` (>= 32 chars)
- `JWT_REFRESH_SECRET=...` (>= 32 chars)
- `ACCESS_TOKEN_EXPIRES_IN=15m`
- `REFRESH_TOKEN_EXPIRES_IN=7d`
- `REFRESH_TOKEN_COOKIE_NAME=nexus_refresh_token`

### Base de datos

Después del primer deploy, ejecuta migraciones contra la DB de producción:

```bash
pnpm --filter @nexus/api prisma:generate
pnpm --filter @nexus/api prisma:migrate
```

> Hazlo apuntando a la `DATABASE_URL` de producción.

## 2) Frontend (`apps/web`)

### Archivo ya preparado

- `apps/web/vercel.json`

### Variables de entorno en Vercel

Configura en el proyecto `nexus-web`:

- `VITE_API_URL=https://TU_BACKEND_URL/api`
- `VITE_SOCKET_URL=https://TU_BACKEND_URL`

## 3) Orden recomendado de publicación

1. Publica primero `nexus-api`.
2. Copia su URL pública.
3. Configura `VITE_API_URL` y `VITE_SOCKET_URL` en `nexus-web`.
4. Publica `nexus-web`.
5. Actualiza `CLIENT_ORIGIN` en `nexus-api` con la URL final del frontend y redeploy.

## 4) Nota importante sobre Socket.IO

Tu backend inicializa Socket.IO en servidor HTTP tradicional (`src/server.ts`).
En Vercel Serverless, WebSocket no funciona igual que en un server persistente.

Si necesitas realtime estable, deja API realtime en Railway/Render/Fly y mantén frontend en Vercel.
Si solo necesitas REST (auth, tareas, notas, etc.), esta configuración serverless funciona bien.
