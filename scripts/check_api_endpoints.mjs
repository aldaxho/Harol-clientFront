#!/usr/bin/env node
// Probe only /api endpoints and report which return JSON (for frontend consumption)
// Usage: node scripts/check_api_endpoints.mjs [baseUrl]
const base = process.argv[2] || 'http://127.0.0.1:8000'

const endpoints = [
  { method: 'POST', path: '/api/login', body: { correo: 'probe@example.com', contraseña: 'probe' } },
  { method: 'POST', path: '/api/logout' },
  { method: 'GET',  path: '/api/me' },
  { method: 'GET',  path: '/api/aulas' },
  { method: 'GET',  path: '/api/materias' },
  { method: 'GET',  path: '/api/grupos' },
  { method: 'GET',  path: '/api/horarios' },
  { method: 'GET',  path: '/api/docentes' },
  { method: 'GET',  path: '/api/gestiones' },
]

async function probe(ep) {
  const url = base.replace(/\/$/, '') + ep.path
  const opt = { method: ep.method, headers: { Accept: 'application/json' } }
  if (ep.body) {
    opt.headers['Content-Type'] = 'application/json'
    opt.body = JSON.stringify(ep.body)
  }

  try {
    const res = await fetch(url, opt)
    const ct = res.headers.get('content-type') || ''
    const text = await res.text()
    const isJson = ct.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')
    return { path: ep.path, method: ep.method, status: res.status, contentType: ct, isJson }
  } catch (err) {
    return { path: ep.path, method: ep.method, error: String(err) }
  }
}

(async () => {
  console.log(`Probing API endpoints on ${base}`)
  const results = []
  for (const ep of endpoints) {
    process.stdout.write(`- ${ep.method} ${ep.path} ... `)
    await new Promise(r => setTimeout(r, 120))
    const r = await probe(ep)
    results.push(r)
    if (r.error) console.log('ERROR:', r.error)
    else console.log(`${r.status} ${r.isJson ? '(JSON)' : '(non-JSON)'} - ${r.contentType.split(';')[0] || 'unknown'}`)
  }

  console.log('\nSummary (only /api endpoints):')
  for (const r of results) {
    if (r.error) console.log(`${r.method} ${r.path} -> ERROR: ${r.error}`)
    else console.log(`${r.method} ${r.path} -> ${r.status} ${r.isJson ? '[JSON]' : '[HTML/Other]'} ${r.contentType.split(';')[0] || ''}`)
  }

  console.log('\nInterpretation: Use the endpoints marked [JSON] directly from your React frontend. Endpoints marked [HTML/Other] return HTML views and are not safe for JSON consumption.')
})()
