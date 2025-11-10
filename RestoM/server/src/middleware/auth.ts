const jwt: any = require('jsonwebtoken')

export const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization)
  if (!authHeader) return res.status(401).json({ error: 'missing token' })
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}
