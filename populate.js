const fs = require('fs/promises')
const Job = require('./src/models/jobModel')
const connectDB = require('./src/db/connectDb')
require("dotenv").config();


const start = async() => {
    try {
        await connectDB(process.env.MONGODB_URL)
        await Job.deleteMany()
        const jsonProducts = JSON.parse(await fs.readFile('./mock-data.json'))
        await Job.create(jsonProducts)
        console.log('Success')
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}


start()