// /api/wordpress.js — Vercel serverless proxy for WordPress REST API
// Uses APP_URL, APP_USER, APP_PASSWORD environment variables

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wpUrl = process.env.APP_URL?.replace(/\/$/, '');
  const wpUser = process.env.APP_USER;
  const wpPass = process.env.APP_PASSWORD;

  if (!wpUrl || !wpUser || !wpPass) {
    return res.status(500).json({ error: 'WordPress credentials not configured in Vercel environment variables.' });
  }

  const creds = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const { action, payload } = req.body;

  try {
    // action: 'get_category' | 'get_author' | 'upload_image' | 'create_post'
    if (action === 'get_category') {
      const r = await fetch(`${wpUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(payload.cat)}&per_page=1`, {
        headers: { 'Authorization': `Basic ${creds}` }
      });
      const data = await r.json();
      return res.status(200).json({ id: data.length ? data[0].id : 1 });
    }

    if (action === 'get_author') {
      const r = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(payload.email)}&per_page=1`, {
        headers: { 'Authorization': `Basic ${creds}` }
      });
      const data = await r.json();
      return res.status(200).json({ id: data.length ? data[0].id : 0 });
    }

    if (action === 'upload_image') {
      // payload.imageDataUrl: full data URL (jpeg or png)
      // payload.slug: filename slug
      const dataUrl = payload.imageDataUrl;
      const isJpeg = dataUrl.startsWith('data:image/jpeg');
      const base64 = dataUrl.split(',')[1];
      const imgBuffer = Buffer.from(base64, 'base64');
      const ext = isJpeg ? 'jpg' : 'png';
      const contentType = isJpeg ? 'image/jpeg' : 'image/png';
      const filename = `${payload.slug || 'imagen'}-featured.${ext}`;

      const r = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': contentType
        },
        body: imgBuffer
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || 'Image upload failed' });
      return res.status(200).json({ id: data.id || 0 });
    }

    if (action === 'create_post') {
      const r = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload.post)
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || 'Post creation failed' });
      return res.status(200).json({
        id: data.id,
        editUrl: `${wpUrl}/wp-admin/post.php?post=${data.id}&action=edit`
      });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
