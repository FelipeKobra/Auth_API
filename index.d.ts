import UserModel from './src/Models/UserModel'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface User extends UserModel {}
  }
}
