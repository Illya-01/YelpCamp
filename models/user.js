import { Schema, model } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const UserSchema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true,
   },
})

UserSchema.plugin(passportLocalMongoose)

export const User = model('User', UserSchema)
