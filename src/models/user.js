const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
},  password: {
        type: String,
        required: true,
        trim: true, 
        minLength: 7,
        validate(value) {
           if(value.toLowerCase().includes('password')) {
               throw new Error('Password cannot contain "password"')
           }
        }
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid. ')
            }
        },
        
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
          if (value < 0) {
              throw new Error('The actual fuck. Age must be a positive number!')
          }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar : {
        type: Buffer,
    }

}, {
    
    timestamps: true,

})

//virtual property: relationship between two entitites
userSchema.virtual('tasks', {
    ref: 'Task',
    //relationship between the user _id and the owner id
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token: token})
    
    await user.save()

    return token 
    
}
userSchema.methods.toJSON = function () {
    const user = this
    //toObject is a mongoose's method.
    const userObject = user.toObject()
    //delete operator:
    delete userObject.password
    delete userObject.tokens 
    delete userObject.avatar

    return userObject
}
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email})
  if(!user) {
      throw new Error("Unable to login")
  }
  const isMatch = await bcrypt.compare(password,user.password)

  if (!isMatch) {
      throw new Error('Unable to login')
  }

  return user
}
//hash the plaintext password before saving
userSchema.pre('save', async function (next) {
  const user = this 

  if( user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
  }
  //to know when the process is done and eventually save the user
  next()
})

//delete user tasks when user is removed

userSchema.pre('remove', async function (next) {
    const user = this
    
    await Task.deleteMany({ owner 
        
        : user._id })

    next()
})

const User = mongoose.model('User', userSchema)



module.exports = User;