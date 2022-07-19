import { DBModel } from '../db-model'

interface ILevels extends INewLevels {
  id: number
  rank: number
}

interface INewLevels {
  guildId: string
  userId: string
  exp: number
}

const collection = 'levels'

export class Levels extends DBModel<ILevels> {

  public collection = collection

  public static async add(levels: INewLevels) {
    return super.create<Levels>(`
      INSERT INTO ${collection} ("guildId", "userId", exp)
      SELECT '${levels.guildId}', '${levels.userId}', ${levels.exp}
      WHERE NOT EXISTS (
        SELECT 1 FROM ${collection} WHERE "guildId" = '${levels.guildId}'
      )
    `, Levels)
  }

  public static fetchUserData(guildId: string, userId: string) {
    return super.fetchOne<Levels>(`
      SELECT *, row_number() over(order by exp) AS rank FROM ${collection}
      WHERE "guildId" = '${guildId}'
      AND "userId" = '${userId}'
    `, Levels)
  }

  public static async addExp(guildId: string, userId: string, exp: number) {
    await Levels.add({ guildId, userId, exp: 0 })
    return super.fetchOne<Levels>(`
      UPDATE ${collection}
      SET exp = exp + ${exp}
      WHERE "guildId" = '${guildId}'
      AND "userId" = '${userId}'
    `, Levels)
  }

  public static async removeExp(guildId: string, userId: string, exp: number) {
    await Levels.add({ guildId, userId, exp: 0 })
    return super.fetchOne<Levels>(`
      UPDATE ${collection}
      SET exp = exp - ${exp}
      WHERE "guildId" = '${guildId}'
      AND "userId" = '${userId}'
    `, Levels)
  }

  public get id() {
    return this.data.id
  }

  public get guildId() {
    return this.data.guildId
  }

  public get userId() {
    return this.data.userId
  }

  public get exp() {
    return this.data.exp
  }

  public get rank() {
    return this.data.rank
  }

}