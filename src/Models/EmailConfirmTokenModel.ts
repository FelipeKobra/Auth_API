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
export default class EmailConfirmToken extends Model<
  InferAttributes<EmailConfirmToken>,
  InferCreationAttributes<EmailConfirmToken>
> {
  @ForeignKey(() => User)
  @Column({ unique: true, type: DataType.INTEGER })
  declare user_id: number

  @Column(DataType.TEXT)
  declare token: string

  @Column(DataType.DATE)
  declare expire_date: Date

  @Default(null)
  @Column(DataType.TEXT)
  declare emailVisualizer?: string
}
