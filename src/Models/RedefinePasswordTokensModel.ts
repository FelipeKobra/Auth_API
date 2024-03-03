import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { InferAttributes, InferCreationAttributes } from 'sequelize/types/model'
import User from './UserModel'

@Table
export default class RedefinePasswordTokens extends Model<
  InferAttributes<RedefinePasswordTokens>,
  InferCreationAttributes<RedefinePasswordTokens>
> {
  @ForeignKey(() => User)
  @Column({ unique: true, type: DataType.INTEGER })
  declare user_id: number

  @Column(DataType.TEXT)
  declare token: string

  @Column(DataType.DATE)
  declare expire_date: Date
}
