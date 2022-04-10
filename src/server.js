const express = require("express");
const notFoundMiddleWare = require("./middleWare/not-found");
const connectDB = require("./db/connectDb");
const morgan = require('morgan')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const userRouter = require('./routes/user')
const jobsRouter = require('./routes/jobsRoute')
const auth = require('./middleWare/auth')

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;


if(process.env.NODE_ENV !== 'production'){
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())
app.use(cors({
  origin: ['https://jobifyproj.netlify.app'],
  credentials: true
}))

app.use('/api/v1/auth', userRouter)
app.use('/api/v1/jobs', auth, jobsRouter)

app.use(notFoundMiddleWare);

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
