# Tierra Viva — Agente Editorial de Agricultura

Herramienta interna de IA para generar artículos de agricultura para Que Pasa Media.

## Deploy en Vercel (5 minutos)

### 1. Subir a GitHub
1. Ve a github.com → New repository → nombre: `tv-agente-editorial`
2. Sube todos estos archivos al repo

### 2. Conectar a Vercel
1. Ve a vercel.com → Add New Project
2. Importa el repo `tv-agente-editorial` de GitHub
3. Click **Deploy** (sin cambiar nada)

### 3. Configurar variables de entorno (CRÍTICO)
En Vercel → Project Settings → Environment Variables, agregar:

| Variable | Valor |
|----------|-------|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic (sk-ant-api03-...) |
| `OPENAI_API_KEY` | Tu API key de OpenAI (sk-...) |

Después de agregar las variables → **Redeploy** el proyecto.

### 4. Listo
Tu agente estará en: `https://tv-agente-editorial.vercel.app`

Comparte esa URL con el cliente. No necesita API keys, no necesita instalar nada.

---

## Para actualizar el agente
1. Reemplaza `public/index.html` con la nueva versión
2. Haz commit y push a GitHub
3. Vercel redeploya automáticamente

## Estructura del proyecto
```
tv-agente/
├── api/
│   ├── anthropic.js    ← Proxy para Anthropic API (clave en servidor)
│   └── openai.js       ← Proxy para OpenAI/DALL-E (clave en servidor)
├── public/
│   └── index.html      ← El agente completo
├── vercel.json         ← Configuración de rutas
└── README.md
```

## Seguridad
- Las API keys viven en Vercel como variables de entorno
- Nunca se exponen en el browser del cliente
- El cliente solo ve la URL del agente
