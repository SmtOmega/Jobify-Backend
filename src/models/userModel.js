const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        minlength: 3,
        maxlength: 20,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,

    },
    lastName: {
        type: String,
        maxlength: 20,
        trim: true,
        default: 'lastname'
    },
    location: {
        type: String,
        maxlength: 20,
        trim: true,
        default: 'My City'

    }


})
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password

    return userObject
}
userSchema.pre('save', async function(){
    const user = this
    const salt = await bcrypt.genSalt(10)

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, salt)
    }
})

userSchema.methods.generateToken = function(){
    user = this
    return jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
    
}

userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Invalid Login credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Invalid login credentials')
    }

    return user
}

userSchema.virtual('jobs',{
    ref: 'Job',
    localField: '_id',
    foreignField: 'createdBy'
})

const User = mongoose.model('User', userSchema)

module.exports = User