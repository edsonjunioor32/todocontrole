const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const DEFAULT_ORIGIN = 'https://edsonjunioor32.github.io';

function allowedOrigins(env) {
  return String(env.APP_ORIGINS || DEFAULT_ORIGIN).split(',').map((value) => value.trim()).filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const origins = allowedOrigins(env);
  const allowOrigin = origin && origins.includes(origin) ? origin : origins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) }
  });
}

function text(data, status) {
  return new Response(data, { status: status || 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

function nowISO() { return new Date().toISOString(); }

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pairingCode() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, '0')).join('');
}

function parseMoney(value) {
  let text = String(value || '').trim().replace(/[R$\s]/g, '');
  if (!text) return 0;
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  const amount = Number(text);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function pad(value) { return String(value).padStart(2, '0'); }

function todayISO() { return new Date().toISOString().slice(0, 10); }

function extractHint(textValue, pattern) {
  const match = textValue.match(pattern);
  return match ? String(match[1] || '').trim().replace(/\s+/g, ' ') : '';
}

function parseTelegramMessage(message) {
  const textValue = String(message || '').trim();
  const normalized = textValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const amountMatch = textValue.match(/r\$\s*([\d.]+(?:,\d{1,2})?)/i) || textValue.match(/(?:^|\s)(\d+(?:[.,]\d{1,2})?)(?:\s|$)/);
  const amount = parseMoney(amountMatch ? amountMatch[1] : '0');
  const type = /\b(recebi|receita|salario|entrada|ganhei|venda|deposito)\b/i.test(normalized) ? 'income' : 'expense';
  let date = todayISO();
  const dateMatch = normalized.match(/\b(?:dia|em)\s+(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/);
  if (dateMatch) {
    const year = dateMatch[3] ? Number(dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : Number(todayISO().slice(0, 4));
    date = year + '-' + pad(Number(dateMatch[2])) + '-' + pad(Number(dateMatch[1]));
  }
  const monthIndex = MONTHS.findIndex((month) => normalized.includes(month));
  const yearMatch = normalized.match(/\b(20\d{2})\b/);
  const billingMonth = monthIndex >= 0 ? (yearMatch ? yearMatch[1] : todayISO().slice(0, 4)) + '-' + pad(monthIndex + 1) : date.slice(0, 7);
  const cardName = extractHint(textValue, /cart[aã]o\s+([^,;]+?)(?=\s+fatura\b|\s+vencimento\b|[,;]|$)/i);
  const accountName = extractHint(textValue, /(?:conta|banco)\s+([^,;]+?)(?=\s+cart[aã]o\b|\s+categoria\b|[,;]|$)/i);
  const categoryName = extractHint(textValue, /categoria\s+([^,;]+?)(?=\s+cart[aã]o\b|\s+fatura\b|[,;]|$)/i);
  const description = textValue
    .replace(/r\$\s*[\d.]+(?:,\d{1,2})?/ig, '')
    .replace(/(?:^|\s)(?:gastei|paguei|compra|despesa|recebi|receita|ganhei|entrada|venda|deposito)(?=\s|$)/ig, '')
    .replace(/\b(?:dia|em)\s+\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?/ig, '')
    .replace(/\b(?:fatura|vencimento|mes|mês)\s+(?:de\s+)?[a-zç]+(?:\s+20\d{2})?/ig, '')
    .replace(/\bcart[aã]o\s+[^,;]+/ig, '')
    .replace(/\b(?:conta|banco|categoria)\s+[^,;]+/ig, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*(?:no|na|em|de)\s+/i, '')
    .replace(/[,-]+$/, '')
    .trim();
  return {
    amount,
    type: cardName || /\bcart[aã]o\b|\bfatura\b/i.test(normalized) ? 'expense' : type,
    date,
    description: description || 'Lançamento via Telegram',
    cardName,
    accountName,
    categoryName,
    billingMonth,
    isCard: Boolean(cardName || /\bcart[aã]o\b|\bfatura\b/i.test(normalized))
  };
}

async function authFromRequest(request, db) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const tokenHash = await sha256(token);
  const connection = await db.prepare('SELECT chat_id, bot_username, last_update_id FROM telegram_connections WHERE token_hash = ?').bind(tokenHash).first();
  if (connection) return { tokenHash, connection };
  const pairing = await db.prepare('SELECT id, status, chat_id, bot_username, expires_at FROM telegram_pairings WHERE token_hash = ?').bind(tokenHash).first();
  return pairing ? { tokenHash, pairing } : null;
}

async function sendTelegramMessage(env, chatId, message) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

async function createPairing(request, env) {
  if (!env.DB) return json({ error: 'Banco do Telegram indisponível.' }, 503, request, env);
  const token = randomToken();
  const code = pairingCode();
  const createdAt = nowISO();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await env.DB.prepare('DELETE FROM telegram_pairings WHERE expires_at < ?').bind(createdAt).run();
  await env.DB.prepare('INSERT INTO telegram_pairings (id, code_hash, token_hash, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(randomToken(), await sha256(code), await sha256(token), 'pending', expiresAt, createdAt).run();
  return json({ pairingCode: code, pairToken: token, expiresAt }, 201, request, env);
}

async function pairingStatus(request, env) {
  if (!env.DB) return json({ error: 'Banco do Telegram indisponível.' }, 503, request, env);
  const auth = await authFromRequest(request, env.DB);
  if (!auth) return json({ status: 'not-configured' }, 200, request, env);
  if (auth.connection) return json({ status: 'linked', chatId: String(auth.connection.chat_id), botUsername: auth.connection.bot_username || env.TELEGRAM_BOT_USERNAME || '' }, 200, request, env);
  const expired = new Date(auth.pairing.expires_at).getTime() <= Date.now();
  return json({ status: expired ? 'expired' : auth.pairing.status, chatId: auth.pairing.chat_id ? String(auth.pairing.chat_id) : '', botUsername: auth.pairing.bot_username || env.TELEGRAM_BOT_USERNAME || '' }, 200, request, env);
}

async function syncTransactions(request, env, url) {
  if (!env.DB) return json({ error: 'Banco do Telegram indisponível.' }, 503, request, env);
  const auth = await authFromRequest(request, env.DB);
  if (!auth || !auth.connection) return json({ error: 'Telegram ainda não foi pareado.' }, 401, request, env);
  const after = Math.max(0, Number(url.searchParams.get('after') || 0));
  const result = await env.DB.prepare('SELECT id, update_id, amount, type, date, description, card_name, account_name, category_name, billing_month, created_at FROM telegram_transactions WHERE chat_id = ? AND update_id > ? ORDER BY update_id ASC LIMIT 100')
    .bind(String(auth.connection.chat_id), after).all();
  const rows = result.results || [];
  const cursor = rows.length ? Number(rows[rows.length - 1].update_id) : after;
  return json({ cursor, transactions: rows.map((row) => ({ id: row.id, externalId: row.id, amount: row.amount, type: row.type, date: row.date, description: row.description, cardName: row.card_name || '', accountName: row.account_name || '', categoryName: row.category_name || '', billingMonth: row.billing_month || '', isCard: Boolean(row.card_name || row.billing_month), createdAt: row.created_at })) }, 200, request, env);
}

async function handleWebhook(request, env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TELEGRAM_WEBHOOK_SECRET) return text('Unauthorized', 401);
  if (!env.DB) return text('Database unavailable', 503);
  let update;
  try { update = await request.json(); } catch (error) { return text('Invalid JSON', 400); }
  const message = update.message || update.business_message;
  const chatId = message && message.chat && message.chat.id != null ? String(message.chat.id) : '';
  const input = message && typeof message.text === 'string' ? message.text.trim() : '';
  if (!chatId || !input) return text('OK');

  const startMatch = input.match(/^\/start(?:@\w+)?\s+([0-9]{6})$/i);
  if (startMatch) {
    const codeHash = await sha256(startMatch[1]);
    const pairing = await env.DB.prepare('SELECT id, token_hash, bot_username FROM telegram_pairings WHERE code_hash = ? AND status = ? AND expires_at > ?').bind(codeHash, 'pending', nowISO()).first();
    if (!pairing) { await sendTelegramMessage(env, chatId, 'Esse código expirou. Gere um novo código no Todo Controle.'); return text('OK'); }
    const linkedAt = nowISO();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO telegram_connections (chat_id, token_hash, bot_username, linked_at, last_update_id) VALUES (?, ?, ?, ?, 0) ON CONFLICT(chat_id) DO UPDATE SET token_hash = excluded.token_hash, bot_username = excluded.bot_username, linked_at = excluded.linked_at').bind(chatId, pairing.token_hash, pairing.bot_username || env.TELEGRAM_BOT_USERNAME || '', linkedAt),
      env.DB.prepare('UPDATE telegram_pairings SET status = ?, chat_id = ?, linked_at = ? WHERE id = ?').bind('linked', chatId, linkedAt, pairing.id)
    ]);
    await sendTelegramMessage(env, chatId, 'Telegram conectado ao Todo Controle. Agora envie mensagens como: gastei R$ 35,90 no mercado.');
    return text('OK');
  }

  const connection = await env.DB.prepare('SELECT chat_id FROM telegram_connections WHERE chat_id = ?').bind(chatId).first();
  if (!connection) { await sendTelegramMessage(env, chatId, 'Para conectar, abra o Todo Controle, gere um código e envie /start CÓDIGO aqui.'); return text('OK'); }
  if (/^\/(help|start)\b/i.test(input)) { await sendTelegramMessage(env, chatId, 'Envie uma mensagem financeira simples, por exemplo: paguei R$ 42,90 no mercado.'); return text('OK'); }

  const parsed = parseTelegramMessage(input);
  if (!parsed.amount) {
    await sendTelegramMessage(env, chatId, 'Não identifiquei um valor. Tente algo como: gastei R$ 35,90 no mercado.');
    return text('OK');
  }
  const updateId = Number(update.update_id || message.message_id || Date.now());
  const externalId = 'telegram:' + chatId + ':' + updateId;
  const createdAt = nowISO();
  const inserted = await env.DB.prepare('INSERT OR IGNORE INTO telegram_transactions (id, chat_id, update_id, message_id, raw_text, amount, type, date, description, card_name, account_name, category_name, billing_month, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(externalId, chatId, updateId, Number(message.message_id || 0), input, parsed.amount, parsed.type, parsed.date, parsed.description, parsed.cardName, parsed.accountName, parsed.categoryName, parsed.billingMonth, createdAt).run();
  if (inserted.meta && inserted.meta.changes) {
    await env.DB.prepare('UPDATE telegram_connections SET last_update_id = ? WHERE chat_id = ?').bind(updateId, chatId).run();
    await sendTelegramMessage(env, chatId, 'Lançamento registrado: ' + parsed.description + ' · R$ ' + parsed.amount.toFixed(2).replace('.', ','));
  }
  return text('OK');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    if (url.pathname === '/health') return json({ ok: true, service: 'todo-controle-telegram' }, 200, request, env);
    if (url.pathname === '/telegram/webhook' && request.method === 'POST') return handleWebhook(request, env);
    if (url.pathname === '/api/telegram/pairing' && request.method === 'POST') return createPairing(request, env);
    if (url.pathname === '/api/telegram/pairing/status' && request.method === 'GET') return pairingStatus(request, env);
    if (url.pathname === '/api/telegram/sync' && request.method === 'GET') return syncTransactions(request, env, url);
    return json({ error: 'Not found' }, 404, request, env);
  }
};
