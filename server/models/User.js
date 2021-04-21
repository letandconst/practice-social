const { model, Schema } = require('mongoose')

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  post: [
    {
      body: String,
      createdAt: String,
      comments: [
        {
          body: String,
          username: String,
          createdAt: String
        }
      ],
      likes: [
        {
          username: String,
          createdAt: String
        }
      ]
    }
  ],

  postPosted: {
    type: Schema.Types.ObjectId,
    ref: 'posts'
  }
})

module.exports = model('User', userSchema)
