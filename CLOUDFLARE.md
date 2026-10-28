# Hosting del frontend en Cloudflare

El frontend puede publicarse como archivos estáticos en Cloudflare Workers sin
ejecutar código Worker. El backend continúa en Render y los medios continúan en
R2.

## Arquitectura

- Frontend: Cloudflare Workers Static Assets.
- Backend: `https://pupas-mayorista-api.onrender.com`.
- Medios: `https://imagenes.pupasmayorista.com.ar`.
- SPA: las navegaciones que no coinciden con un archivo reciben `index.html`.
- `run_worker_first` permanece desactivado para no convertir solicitudes
  estáticas en ejecuciones de Worker.

`vercel.json` se conserva mientras dure la migración para permitir un rollback
inmediato a Vercel.

## Preparación local

```bash
npm install
npm run build:cloudflare
npm run cloudflare:dev
```

`build:cloudflare` fija explícitamente la URL pública del backend. Esto evita
que un `.env` local con `127.0.0.1` termine dentro de una build de Cloudflare.

La configuración está en `wrangler.jsonc`. Las reglas de caché equivalentes a
Vercel están en `public/_headers` y Vite las copia a `dist/_headers`.

## Despliegue remoto

La cuenta ya está vinculada a Wrangler. Para publicar una versión nueva:

```bash
npm run cloudflare:deploy
```

La preview estable está disponible en
`https://pupas-mayorista-frontend.faroemiliano.workers.dev`. El backend admite
ese origen exacto en CORS para que puedan probarse login, catálogo y carrito.

## Pruebas previas al cambio de DNS

- Abrir directamente `/`, `/catalogo`, `/producto/...`, `/mi-cuenta` y
  `/restablecer-clave`.
- Probar login, catálogo y carrito sin confirmar pedidos.
- Confirmar que las imágenes y videos se descarguen desde R2.
- Confirmar `robots.txt`, manifest, favicon y metadatos sociales.
- Verificar los encabezados de caché de `/assets/`, `/brand/` e `/images/`.
- Confirmar que no se invoque código Worker para servir archivos estáticos.

## Estado de producción y rollback

Desde el 28 de octubre de 2026, `www.pupasmayorista.com.ar` está asociado al
Worker `pupas-mayorista-frontend`. El dominio raíz continúa temporalmente en
Vercel y redirige a `www`, por lo que no se debe borrar todavía el proyecto de
Vercel.

Si aparece un problema, se elimina el dominio personalizado `www` del Worker y
se restaura este registro DNS:

- Tipo: `CNAME`.
- Nombre: `www`.
- Destino: `4db67d0daa369ab5.vercel-dns-017.com`.
- Proxy: `DNS only`.
- TTL: `Auto`.

El backend y R2 no se modifican durante este rollback.

Cuando termine el período de observación, el dominio raíz puede migrarse a
Cloudflare con una redirección permanente `301` hacia `www`, conservando ruta y
parámetros. Esa tarea sigue pendiente.
