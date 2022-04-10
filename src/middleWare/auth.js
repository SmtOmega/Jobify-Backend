const jwt = require("jsonwebtoken")
const User = require('../models/userModel')


const auth = async(req, res, next) =>{
    try {

        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded.userId})

        if(!user){
            throw new Error('Authentication Invalid')
        }
        req.user = user
        next()
    }
    catch(error){
        res.status(401).json({msg:"You are not authorized to access this page"})
    }
}

module.exports = auth