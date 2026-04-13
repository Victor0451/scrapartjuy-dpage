# ScrapArtJuy — Sistema de Entrega Digital de PDFs

## Idea y finalidad

ScrapArtJuy es una tienda en Tienda Nube que vende productos digitales (PDFs de scrapbooking). El problema a resolver era entregar esos archivos automáticamente al cliente una vez confirmado el pago, sin depender de herramientas pagas de terceros, sin backend propio y sin que el cliente tenga que crear una cuenta.

La solución construida es un ecosistema de tres piezas que trabajan juntas:

```
Tienda Nube → Email de confirmación → Página de descarga (Vercel) → Google Drive
```

El cliente compra, recibe un email con un botón de descarga, hace clic, llega a una página personalizada con su producto y descarga el PDF desde Google Drive.

---

## Arquitectura del sistema

### Piezas del ecosistema

| Pieza | Tecnología | Rol |
|---|---|---|
| Tienda de productos | Tienda Nube | Catálogo, carrito y cobro |
| Email de confirmación | Liquid (template TN) | Dispara el link de descarga |
| Página de descarga | HTML + JS en Vercel | Muestra el producto y el botón |
| Archivos PDF | Google Drive (compartido) | Hosting del archivo final |
| Catálogo de productos | `productos.json` en repo | Fuente de verdad de todos los productos |
| Panel de administración | `admin.html` en Vercel | Gestión de productos sin tocar código |
| API de guardado | Vercel Serverless (`api/guardar.js`) | Escribe en el repo via GitHub API |

### Flujo completo paso a paso

1. El cliente compra uno o más PDFs en Tienda Nube.
2. Tienda Nube dispara el email de "Confirmación de pago" usando el template Liquid customizado.
3. El email contiene un botón de descarga por cada producto comprado. El link tiene la forma:
   ```
   https://scrapartjuy-dpage.vercel.app?nombre=Mundo Animal CHICO
   ```
4. El cliente hace clic y llega a `index.html` en Vercel.
5. La página lee el parámetro `?nombre=` de la URL, busca el producto en `productos.json` y renderiza:
   - Nombre del producto
   - Botón de descarga (abre Google Drive)
   - Contraseña del PDF (si tiene)
   - Beneficios del producto
   - Testimonio de cliente
   - Oferta de upsell
6. El cliente descarga el PDF desde Google Drive (sin necesidad de cuenta de Google).

---

## Archivos del proyecto

### `index.html`
Página pública de descarga, hosteada en Vercel.

- Hace `fetch('productos.json')` al cargar para obtener el catálogo.
- Lee la URL para identificar el producto:
  - `?id=mundo-animal-chico` → busca directamente por clave en el JSON (uso interno/admin).
  - `?nombre=Mundo Animal CHICO` → busca por el campo `nombre` (comparación case-insensitive), que es lo que genera el email de Tienda Nube.
- Si el producto no existe, muestra una pantalla de error amigable.
- Si el producto tiene contraseña (`contrasena`), muestra un cuadro con la contraseña y botón de copiar.
- Los beneficios se generan dinámicamente desde el JSON.

### `productos.json`
Fuente de verdad de todos los productos. Estructura:

```json
{
  "config": {
    "marca": "ScrapArtJuy",
    "email": "hola@tumarca.com",
    "instagram": "https://instagram.com/scrapartjuy",
    "facebook": "",
    "tiktok": "https://tiktok.com/@scrapartjuy"
  },
  "productos": {
    "mundo-animal-chico": {
      "nombre": "Mundo Animal CHICO",
      "linkDrive": "https://drive.google.com/file/d/...",
      "contrasena": "Scrap1",
      "beneficios": [
        { "titulo": "Titulo", "desc": "Descripcion." },
        { "titulo": "Titulo", "desc": "Descripcion.", "bonus": true }
      ],
      "testimonio": "Texto del testimonio.",
      "testimonioAutor": "— Nombre, clienta verificada",
      "upsellNombre": "Nombre del producto complementario",
      "upsellLink": "https://scrapartjuy.com/"
    }
  }
}
```

**Regla importante:** la clave de cada producto (ej. `mundo-animal-chico`) debe coincidir con el SKU configurado en Tienda Nube. El campo `nombre` debe coincidir exactamente con el nombre del producto en Tienda Nube, porque el email pasa `?nombre={{product.name}}` y la página busca por ese valor.

### `admin.html`
Panel de administración en `/admin`. Protegido por contraseña (almacenada en variable de entorno de Vercel como `ADMIN_PASSWORD`).

Permite:
- Editar la configuración global (marca, email, redes sociales).
- Agregar, editar y eliminar productos.
- Publicar los cambios (escribe `productos.json` en el repositorio via GitHub API).

Al publicar, los cambios se reflejan en producción en segundos (Vercel redeployea automáticamente).

### `api/guardar.js`
Función serverless de Vercel. Recibe el JSON actualizado desde el panel admin y lo escribe en el repositorio usando la GitHub API.

Variables de entorno requeridas en Vercel:

| Variable | Descripción |
|---|---|
| `ADMIN_PASSWORD` | Contraseña del panel admin |
| `GITHUB_TOKEN` | Personal Access Token de GitHub con permisos de repo |
| `GITHUB_OWNER` | Usuario u organización de GitHub |
| `GITHUB_REPO` | Nombre del repositorio |

### `email-confirmacion.html`
Template HTML para pegar en Tienda Nube en **Notificaciones → Confirmación de pago**.

Usa el motor Liquid de Tienda Nube. Variables utilizadas:
- `{{contact_name}}` — nombre del comprador
- `{{store_name}}` — nombre de la tienda
- `{{order.id}}` — número de pedido
- `{{product.name}}` — nombre del producto (dentro de `{% for product in order.products %}`)
- `{{product.quantity}}` — cantidad comprada

El template genera un bloque de descarga por cada producto comprado usando un loop `{% for %}`. El link de descarga usa `?nombre={{product.name}}` para que la página identifique el producto correctamente.

### `vercel.json`
Configuración de Vercel:
- Ruta `/admin` → sirve `admin.html`
- Ruta `/api/guardar` → ejecuta `api/guardar.js`
- Ruta `/productos.json` → sirve el JSON estático
- Todo lo demás → `index.html` (para que `?nombre=...` funcione sin importar la ruta)

---

## Configuración de Google Drive

Para que los archivos sean descargables sin que el cliente tenga cuenta de Google:

1. Subir el PDF a Google Drive.
2. Click derecho → **Compartir** → **Cualquier persona con el enlace puede ver**.
3. Copiar el link y pegarlo en `linkDrive` del `productos.json`.

El link de Drive abre el visor de Google Drive. El cliente descarga desde el ícono de descarga (↓) de esa interfaz.

---

## Configuración en Tienda Nube

### SKUs de productos
Cada producto en Tienda Nube debe tener el mismo SKU que la clave en `productos.json`. Esto no afecta el email (que usa `product.name`) pero mantiene consistencia para uso futuro.

### Template de email
1. Ir a **Configuración → Notificaciones → Confirmación de pago**.
2. Seleccionar modo **Código**.
3. Pegar el contenido completo de `email-confirmacion.html`.
4. Guardar.

### Simulación de compra para testear
Tienda Nube permite hacer una compra de prueba desde el panel de administración. Al completarla, llega el email con el template configurado. Se puede cancelar después para no generar stock negativo.

---

## Soporte para múltiples productos en una compra

El sistema soporta que un cliente compre más de un PDF en el mismo pedido. El loop `{% for product in order.products %}` en el email genera un botón de descarga separado por cada producto. Cada botón lleva a la página con el producto correspondiente.

---

## Trabajo realizado en este proyecto

### Migración a sistema multi-producto
- El sistema original soportaba un único PDF hardcodeado.
- Se migró a un catálogo dinámico usando `productos.json` como fuente de verdad.
- `index.html` ahora hace `fetch()` del JSON al cargar y resuelve el producto desde la URL.

### Extracción del catálogo a archivo independiente
- Inicialmente el catálogo estaba en un script JS dentro de `index.html`.
- Se extrajo a `productos.js` y luego a `productos.json` (formato más limpio y accesible desde otras herramientas).

### Soporte de contraseñas por producto
- Se agregó el campo `contrasena` al JSON de cada producto.
- La página muestra un cuadro con la contraseña y botón de copiar solo si el producto tiene ese campo.

### Panel de administración
- Se construyó `admin.html` con autenticación por contraseña.
- Permite gestionar productos y publicar cambios sin tocar el código.
- La publicación usa GitHub API para escribir directamente en el repositorio, triggereando un redeploy automático en Vercel.

### Depuración del template de email (Tienda Nube / Liquid)
Problemas encontrados y resueltos durante el desarrollo:

| Error | Causa | Solución |
|---|---|---|
| `unknown block tag: elsif` | TN usa `elseif`, no `elsif` | Reemplazado |
| `expected block end in if statement` | Liquid tags dentro de atributos HTML | Movido fuera del atributo |
| `contains` no soportado | Operador no disponible en el Liquid de TN | Reemplazado por `==` |
| Variables no se renderizan | Template pegado en modo texto, no código | Pegar en modo "Código" |
| Email truncado | Block `<style>` demasiado grande | Migrado a CSS inline completo |
| `{{product.sku}}` no existe | No es una variable documentada de TN | Reemplazado por `?nombre={{product.name}}` |
| `~` operador (concatenación) | Inconsistente en validador de TN | Eliminado, se usa `{{product.name}}` solo |
| Error al guardar sin mensaje | Secciones de envío con acceso profundo a objetos | Eliminadas (irrelevantes para productos digitales) |

### Soporte de `?nombre=` en la página de descarga
- El email genera links con `?nombre={{product.name}}`.
- Se actualizó `index.html` para buscar productos por el campo `nombre` (case-insensitive) como fallback cuando no hay `?id=`.

---

## Stack tecnológico

- **Frontend:** HTML + CSS + JavaScript vanilla (sin frameworks)
- **Hosting:** Vercel (free tier)
- **Serverless:** Vercel Functions (Node.js)
- **Base de datos:** `productos.json` en el repositorio Git
- **Persistencia de cambios:** GitHub API (el admin escribe el JSON directamente al repo)
- **Archivos PDF:** Google Drive (compartido públicamente)
- **Email:** Template Liquid en Tienda Nube
- **E-commerce:** Tienda Nube

---

## Consideraciones de seguridad

- La contraseña del panel admin vive solo en variables de entorno de Vercel, nunca en el código.
- El `GITHUB_TOKEN` tampoco está en el repo, solo en Vercel.
- La validación de la contraseña sucede en el servidor (`api/guardar.js`), no en el cliente.
- El panel admin en el cliente tiene una comprobación de contraseña solo como UX; la seguridad real está en el endpoint.
- Los PDFs en Google Drive son accesibles por cualquiera con el link, pero el link no está indexado ni es adivinable.

---

## Próximos pasos posibles

- Agregar analytics de descargas (cuántas veces se accede a cada producto).
- Proteger los links de descarga con tokens de un solo uso (más seguridad).
- Agregar imágenes de preview a cada producto en la página de descarga.
- Internacionalización si la tienda crece a otros mercados.
