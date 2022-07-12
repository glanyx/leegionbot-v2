import { DBModel } from '../db-model'

interface IRolegate extends INewRolegate {
  id: number
}

interface INewRolegate {
  guildId: string
  messageId: string
  roleId: string
}

const collection = 'rolegates'

export class Rolegate extends DBModel<IRolegate> {

  public collection = collection

  public static async add(props: INewRolegate) {
    return super.create<Rolegate>(`
      INSERT INTO ${collection} ("guildId")
      SELECT '${''}'
      WHERE NOT EXISTS (
        SELECT 1 FROM ${collection} WHERE "guildId" = '${''}'
      )
    `, Rolegate)
  }

  public static async fetchById(id: number) {
    return super.fetchOne<Rolegate>(`
      SELECT * FROM ${collection}
      WHERE id = id
    `, Rolegate)
  }

  public async update() {
    return super.edit<Rolegate>(`
      UPDATE ${collection} SET
        "" = ${''},
      WHERE "guildId" = '${this.data.guildId}'
    `, Rolegate)
  }

  public get id() {
    return this.data.id
  }

  public get messageId() {
    return this.data.messageId
  }

  public get guildId() {
    return this.data.guildId
  }

  public get roleId() {
    return this.data.roleId
  }

}