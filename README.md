# 📊 Panel de Leads Multi-Cliente — Meta Ads

Un solo deploy para múltiples constructoras y cuentas publicitarias.

---

## 🗂 Estructura

```
meta-ads-dashboard-multi/
├── index.html          ← Frontend (no tocar)
├── vercel.json         ← Config Vercel (no tocar)
├── api/
│   ├── config.js       ← ⭐ AQUÍ agregas clientes y cuentas
│   ├── login.js        ← Autenticación (no tocar)
│   └── meta.js         ← Proxy Meta API (no tocar)
```

---

## ➕ Cómo agregar un cliente nuevo

Edita **solo** `api/config.js`:

```js
nuevocliente: {
  label:    "Nombre Constructora",
  password: "su_clave_secreta",
  accounts: [
    { id: "act_XXXXXXXXXX", label: "Proyecto Alpha" },
    { id: "act_YYYYYYYYYY", label: "Proyecto Beta"  },
  ]
},
```

Haz commit en GitHub → Vercel redespliega automáticamente. ✅

---

## 🔑 Variables de entorno en Vercel

Solo necesitas **2 variables** (no 5 como en la versión por cliente):

| Variable      | Descripción                            |
|---------------|----------------------------------------|
| `META_TOKEN`  | Tu Access Token de Meta Ads            |
| `DASH_SECRET` | Texto aleatorio para firmar sesiones   |

---

## 👤 Qué ve cada usuario al entrar

- **Admin** → selector con todas las cuentas de todas las constructoras
- **Constructora A** → selector con solo sus cuentas
- **Constructora B** → selector con solo sus cuentas

El cliente cambia de cuenta con un clic en la barra superior.

---

## 🚀 Deploy inicial

1. Crea repo en GitHub: `meta-ads-dashboard-multi`
2. Sube los 5 archivos (respetando la carpeta `api/`)
3. Vercel → New Project → importa el repo
4. Agrega `META_TOKEN` y `DASH_SECRET` en Environment Variables
5. Redeploy
6. Settings → Deployment Protection → Disabled

---

## ⏰ Renovar token de Meta (~cada 60 días)

Vercel → Settings → Environment Variables → edita `META_TOKEN` → Redeploy.
