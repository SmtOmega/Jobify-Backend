const express = require('express')
const User = require('../models/userModel')
const handleError = require('../Error/handleError')
const auth = require('../middleWare/auth')
const rateLimiter = require('express-rate-limit')

const router = express.Router()


const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many request from this ip address, please try again after 15 minutes "
})

router.post('/register', apiLimiter, async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = user.generateToken()
        res.status(201).json({user, token, location: user.location})
    } catch (err) {
        const error = handleError(err)
        res.status(400).json({msg: error})
    }
})

router.post('/login', apiLimiter, async(req, res) => {
    const {email, password} = req.body
    try {
        if(!email || !password){
            throw new Error('Please provide all values')
        }

        const user = await User.findByCredentials(email, password)
        const token = user.generateToken()
        res.status(200).json({user, token, location: user.location})
        
    } catch (err) {
        res.status(401).json({msg: err.message})
    }
})

router.patch('/updateUser', auth, async(req, res) => {
    const {email, name, location, lastName} = req.body
    try {
        if(!email || !name || !lastName || !location){
        throw new Error('Please provide all values')    
        }
        const user = req.user
        user.email = email
        user.lastName = lastName
        user.location = location
        user.name = name
        await user.save()
        token = user.generateToken()
        res.status(200).json({user, token, location: user.location})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
})


module.exports = router