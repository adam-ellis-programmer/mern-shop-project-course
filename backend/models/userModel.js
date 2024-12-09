import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

console.log(crypto.randomUUID())

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}
// Middleware that runs before saving a document (`pre-save` hook)
/**
 * `pre('save')` is a Mongoose middleware function that is executed before a User document is saved.
 * - Checks if the password field has been modified (`this.isModified('password')`).
 * - If the password is not modified, it calls `next()` to skip hashing and proceed with saving.
 * - If the password has been modified, it generates a salt and hashes the new password before saving it.
 * This ensures that passwords are always stored securely in an encrypted format.
 */
userSchema.pre('save', async function (next) {
  // The pre method in Mongoose is a middleware function used to execute code before a specified operation is performed on a Mongoose document or model. It is particularly useful for automating certain tasks, such as data validation, logging, or transformations, before saving or querying data.
  if (!this.isModified('password')) {
    next()
  }

  // if we are modyfiing the password
  const salt = await bcrypt.genSalt(10)

  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
