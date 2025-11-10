const http = require('http')

function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', (e) => resolve({ error: e.message }))
    req.setTimeout(5000, () => { req.destroy(); resolve({ error: 'timeout' }) })
  })
}

;(async () => {
  console.log('Checking backend http://localhost:5000/api/health')
  const b = await get('http://localhost:5000/api/health')
  console.log('BACKEND:', b)

  console.log('Checking frontend (vite) http://localhost:5173/api/health')
  const f = await get('http://localhost:5173/api/health')
  console.log('FRONTEND:', f)

  process.exit(0)
})()
