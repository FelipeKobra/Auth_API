import {
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { InferAttributes, InferCreationAttributes } from 'sequelize/types/model'
import User from './UserModel'

@Table
export default class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  @ForeignKey(() => User)
  @Column({ unique: true, type: DataType.INTEGER })
  declare user_id: number

  @Default('oauth')
  @Column(DataType.TEXT)
  declare type?: string

  @Column(DataType.TEXT)
  declare provider: string

  @Column(DataType.TEXT)
  declare providerAccountId: string

  @Default(null)
  @Column(DataType.TEXT)
  declare refreshToken?: string | null

  @Default(null)
  @Column(DataType.TEXT)
  declare accessToken?: string | null

  @Default(null)
  @Column(DataType.INTEGER)
  declare expiresAt?: number | null

  @Default(null)
  @Column(DataType.TEXT)
  declare tokenType?: string | null
}
