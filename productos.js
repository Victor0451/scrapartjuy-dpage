/* ================================================================
   CONFIGURACIÓN GLOBAL DE LA TIENDA
   Editá estos valores una sola vez.
================================================================ */
var CONFIG = {
  marca:     "ScrapArtJuy",
  email:     "hola@tumarca.com",
  instagram: "https://instagram.com/scrapartjuy",
  tiktok:    "https://tiktok.com/@scrapartjuy"
};


/* ================================================================
   CATÁLOGO DE PRODUCTOS
   ─ Cada clave (ej. "guia-finanzas") debe coincidir exactamente
     con el SKU del producto en Tienda Nube.
   ─ Esa misma clave arma la URL del email:
     https://scrapartjuy-dpage.vercel.app?id=guia-finanzas
================================================================ */
var PRODUCTOS = {

  /* ── PRODUCTO 1 ─────────────────────────────────────────── */
  "mundo-animal-chico": {
    nombre:    "Mundo Animal CHICO",
    linkDrive: "https://drive.google.com/file/d/1_AjTwSPisFtBQXyfgs1j9HJzLVQsGjbi/view?usp=drivesdk",

    beneficios: [
      { titulo: "Presupuesto en 30 minutos",  desc: "Método paso a paso para ordenar tus ingresos y gastos sin horas de planillas." },
      { titulo: "Fondo de emergencia",         desc: "Cómo construirlo aunque hoy no sobre nada a fin de mes." },
      { titulo: "Deudas bajo control",         desc: "Estrategia para salir de las deudas en orden, sin angustia." },
      { titulo: "Bonus: planilla de gastos",   desc: "Planilla lista para usar incluida en el PDF.", bonus: true }
    ],

    testimonio:      "Apliqué lo del capítulo 2 el mismo día que lo descargué y los resultados me sorprendieron. No esperaba algo tan completo y tan fácil de aplicar.",
    testimonioAutor: "— María G., clienta verificada",

    upsellNombre: "Pack de Inversión para Principiantes",
    upsellLink:   "https://tutienda.com/pack-inversion"
  },

  /* ── PRODUCTO 2 ─────────────────────────────────────────── */
  "mundo-animal-grande": {
    nombre:    "Mundo Animal GRANDE",
    linkDrive: "https://drive.google.com/file/d/1aw7n1XYnOeXz6MIdSj2RMnkRciKJEwau/view?usp=drivesdk",

    beneficios: [
      { titulo: "Estrategia en redes sociales", desc: "Qué publicar, cuándo y con qué formato para que el algoritmo te favorezca." },
      { titulo: "Copy que vende",               desc: "Fórmulas de escritura persuasiva para posts, stories y emails." },
      { titulo: "Métricas que importan",        desc: "Las 5 métricas clave que te dicen si tu marketing está funcionando." },
      { titulo: "Bonus: calendario editorial",  desc: "Calendario de contenidos de 30 días listo para completar.", bonus: true }
    ],

    testimonio:      "En dos semanas de aplicar la guía mis ventas crecieron un 40%. El capítulo de Instagram Stories fue revelador.",
    testimonioAutor: "— Lucas P., emprendedor verificado",

    upsellNombre: "Pack de Plantillas de Copy",
    upsellLink:   "https://tutienda.com/pack-copy"
  }

  /* ── PRODUCTO 3 — copiá y pegá este bloque para agregar uno nuevo
  ,"clave-del-producto": {
    nombre:    "Nombre del producto",
    linkDrive: "https://drive.google.com/...",

    beneficios: [
      { titulo: "Beneficio 1", desc: "Descripción del resultado que el cliente va a obtener." },
      { titulo: "Beneficio 2", desc: "Orientado al resultado tangible, no al proceso." },
      { titulo: "Beneficio 3", desc: "Resuelve un dolor o frustración específica del cliente." },
      { titulo: "Bonus",       desc: "Un recurso extra que supera sus expectativas.", bonus: true }
    ],

    testimonio:      "Texto del testimonio real de un cliente.",
    testimonioAutor: "— Nombre, cliente verificado",

    upsellNombre: "Nombre del producto complementario",
    upsellLink:   "https://tutienda.com/producto-complementario"
  }
  ── */

};
