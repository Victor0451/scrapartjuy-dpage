module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { password, data } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas en Vercel' });
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/productos.json`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ScrapArtJuy-Admin'
  };

  // Obtener SHA actual del archivo (requerido por GitHub para actualizar)
  const getRes = await fetch(apiUrl, { headers });
  if (!getRes.ok) {
    return res.status(500).json({ error: 'No se pudo leer el archivo en GitHub' });
  }
  const fileData = await getRes.json();
  const sha = fileData.sha;

  // Actualizar archivo con el nuevo contenido
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
  const fecha   = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Actualizar catálogo de productos — ${fecha}`,
      content,
      sha
    })
  });

  if (putRes.ok) {
    return res.status(200).json({ ok: true });
  }

  const err = await putRes.json();
  return res.status(500).json({ error: err.message || 'Error al guardar en GitHub' });
};
