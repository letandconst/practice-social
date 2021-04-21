const { AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')

module.exports = context => {
  // context = { ...header}
  const header = context.req.headers.authorization
  if (header) {
    // Bearer ...
    const token = header.split('Bearer ')[1]
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY)
        return user
      } catch (err) {
        throw new AuthenticationError('Invalid token')
      }
    }
    throw new Error('Authentication error')
  }
  throw new Error('Auth error')
}
