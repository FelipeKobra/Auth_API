import UserModel from './src/Models/UserModel'

declare global {
  namespace Express {
    export interface User extends UserModel {}
  }
}
