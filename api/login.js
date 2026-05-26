import crypto from 'crypto';
import { CLIENTS } from './config.js';

function makeToken(user) {
  return crypto
    .createHmac('sha256', process.env.DASH_SECRET || 'default-secret')
    .update(user + ':' + CLIENTS[user]?.password)
    .digest('hex');
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).end();

  const { user, pass } = req.body || {};
  const client = CLIENTS[user];

  if (!client || client.password !== pass) {
    return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
  }

  const token = makeToken(user);

  // Return token + accounts list (no passwords sent to client)
  return res.json({
    ok:       true,
    token,
    user,
    label:    client.label,
    accounts: client.accounts,
  });
}
