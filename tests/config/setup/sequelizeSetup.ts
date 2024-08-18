import { Sequelize } from 'sequelize-typescript'
import Account from '../../../src/Models/AccountModel'
import EmailConfirmToken from '../../../src/Models/EmailConfirmTokenModel'
import RedefinePasswordTokens from '../../../src/Models/RedefinePasswordTokensModel'
import RefreshToken from '../../../src/Models/RefreshTokenModel'
import User from '../../../src/Models/UserModel'

export const setupSequelize = async () => {
  const sequelize: Sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    models: [
      Account,
      EmailConfirmToken,
      RedefinePasswordTokens,
      RefreshToken,
      User,
    ],
    logging: false,
  })
  await sequelize.sync({ force: true })
  return sequelize
}
