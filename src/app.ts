//Imports
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import express from 'express'
import 'express-async-errors'
import path from 'path'
import errorHandlerMiddleware from './Middlewares/ErrorHandler'
import { environmentCases } from './data/EnvironmentModes'
import sequelize, { syncSequelize } from './libs/sequelize'
import { ProtectedRouter } from './routes/ProtectedRoutes'
import { UserRouter } from './routes/UserRoutes'

//Passport Imports
import passport from 'passport'
import googleStrategy from './Strategies/GoogleStrategy'
import jwtStrategy from './Strategies/JwtStrategy'
import localStrategy from './Strategies/LocalStrategy'
import { AuthRouter } from './routes/AuthRoutes'
import { EmailConfirmRouter } from './routes/ConfirmEmailTokensRoutes'
import { RedefinePasswordRouter } from './routes/RedefinePasswordTokensRoutes'

//General Config
config()
const app = express()
syncSequelize()

//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//Passport Config
app.use(passport.initialize())

//Passport Strategies
passport.use(localStrategy)
passport.use(jwtStrategy)
passport.use(googleStrategy)

//Routes
app.use('/user', UserRouter)
app.use('/confirmEmail', EmailConfirmRouter)
app.use('/redefinePassword', RedefinePasswordRouter)
app.use('/auth', AuthRouter)
app.use('/protected', ProtectedRouter)

//Error Handler
app.use(errorHandlerMiddleware)

export default app
