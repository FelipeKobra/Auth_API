import { Column, DataType, Default, Model, Table } from 'sequelize-typescript'
import { InferAttributes, InferCreationAttributes } from 'sequelize/types/model'

@Table
export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column(DataType.STRING)
  declare name: string

  @Column({ unique: true, type: DataType.STRING })
  declare email: string

  @Column(DataType.TEXT)
  declare password: string | null

  @Default(null)
  @Column(DataType.TEXT)
  declare provider: string

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare confirmed?: boolean

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare blocked?: boolean
}
