import crypto from 'crypto';
import { CLIENTS } from './config.js';

function getUser(token) {
  for (const [user, client] of Object.entries(CLIENTS)) {
    const expected = crypto
      .createHmac('sha256', process.env.DASH_SECRET || 'default-secret')
      .update(user + ':' + client.password)
      .digest('hex');
    if (token === expected) return user;
  }
  return null;
}

function userCanAccessAccount(user, accountId) {
  const client = CLIENTS[user];
  if (!client) return false;
  // Admin sees all
  if (user === 'admin') return true;
  // Others only see their own accounts
  return client.accounts.some(a => a.id === accountId || a.id === 'act_' + accountId);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const user  = getUser(token);
  if (!user) return res.status(401).json({ error: 'Sesión inválida.' });

  const metaToken = process.env.META_TOKEN;
  if (!metaToken) return res.status(500).json({ error: 'META_TOKEN no configurado.' });

  const { path, account, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'Falta el parámetro path.' });

  // Validate account access
  if (account && !userCanAccessAccount(user, account)) {
    return res.status(403).json({ error: 'No tienes acceso a esta cuenta.' });
  }

  // Build URL replacing __ACCOUNT__ with the requested account id
  let accountId = account || '';
  if (accountId && !accountId.startsWith('act_')) accountId = 'act_' + accountId;
  const finalPath = path.replace(/__ACCOUNT__/g, accountId);

  const url = new URL(`https://graph.facebook.com/v21.0/${finalPath}`);
  url.searchParams.set('access_token', metaToken);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    const appUsage  = response.headers.get('x-app-usage');
    const acctUsage = response.headers.get('x-ad-account-usage');
    if (appUsage)  res.setHeader('x-app-usage', appUsage);
    if (acctUsage) res.setHeader('x-ad-account-usage', acctUsage);
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error conectando con Meta: ' + err.message });
  }
}
