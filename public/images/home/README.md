# Medios de la portada

Las imágenes principales, los destacados de colecciones y los videos se
administran desde el panel y se almacenan en Cloudflare R2. No deben agregarse
copias pesadas dentro de `public`, porque Vercel las incluiría nuevamente en
cada despliegue.

Las cargas nuevas reciben una URL versionada y caché inmutable. Las imágenes
del catálogo seleccionadas como destacados se reutilizan directamente desde
R2, sin crear otra copia.
