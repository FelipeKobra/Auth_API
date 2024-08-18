import { Dialect } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import User from '../Models/UserModel'
import RefreshToken from '../Models/RefreshTokenModel'
import { config } from 'dotenv'
import EmailConfirmToken from '../Models/EmailConfirmTokenModel'
import Account from '../Models/AccountModel'
import RedefinePasswordTokens from '../Models/RedefinePasswordTokensModel'
import { environmentCases } from '../data/EnvironmentModes'
config()

const sequelize = new Sequelize({
  port: parseInt(process.env.POSTGRE_PORT as string),
  host: process.env.POSTGRE_HOST as string,
  database: process.env.POSTGRE_DATABASE as string,
  username: process.env.POSTGRE_USERNAME as string,
  password: process.env.POSTGRE_PASSWORD as string,
  dialect: process.env.POSTGRE_DIALECT as Dialect,
  models: [
    User,
    Account,
    RefreshToken,
    EmailConfirmToken,
    RedefinePasswordTokens,
  ],
  logging: false,
})

export function syncSequelize() {
  if (process.env.NODE_ENV !== 'test') {
    sequelize.sync({ alter: environmentCases(true, false) })
  }
}

export default sequelize
