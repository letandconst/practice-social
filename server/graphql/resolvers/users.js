const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const {
  validateRegisterInput,
  validateLoginInput
} = require('../../utils/validations')
const { UserInputError } = require('apollo-server')

function generateToken (user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '1h'
    }
  )
}

module.exports = {
  Query: {
    async getUser (_, { username }) {
      try {
        const user = await User.findOne({ username })
        if (user) {
          return user
        } else {
          throw new Error('User not found')
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async login (_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password)
      const user = await User.findOne({ username })

      if (!user) {
        errors.general = 'Invalid username or password'
        throw new UserInputError('Invalid username or password', { errors })
      }

      if (!valid) {
        throw new UserInputError('Error', { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        errors.general = 'Invalid Password'
        throw new UserInputError('Invalid Password', { errors })
      }

      const token = generateToken(user)

      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    async register (
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // validate user data
      // user already exist, hash password , auth token
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      )
      if (!valid) {
        throw new UserInputError('Errors', { errors })
      }
      const user = await User.findOne({ username })
      if (user) {
        throw new UserInputError('Username is already taken! 🚫', {
          errors: {
            username: 'This username is already taken'
          }
        })
      }
      password = await bcrypt.hash(password, 12)

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      })

      const res = await newUser.save()

      const token = generateToken(res)
      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}
