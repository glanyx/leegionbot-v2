import { DBModel } from '../db-model'
import { logger } from '../../utils'

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
        SELECT 1 FROM ${collection}
          WHERE "guildId" = '${levels.guildId}'
          AND "userId" = '${levels.userId}'
      )
    `, Levels)
  }

  public static fetchUserData(guildId: string, userId: string) {
    return super.fetchOne<Levels>(`
      SELECT l.*, r.rank FROM ${collection} l LEFT JOIN (
        SELECT "guildId", "userId", ROW_NUMBER() OVER(ORDER BY exp DESC) AS rank FROM ${collection} WHERE "guildId" = '${guildId}'
      ) AS r ON l."userId" = r."userId" AND l."guildId" = r."guildId"
      WHERE l."userId" = '${userId}'
      AND l."guildId" = '${guildId}'
    `, Levels)
  }

  public static fetchTop(guildId: string, count: number) {
    return super.query<Levels>(`
      SELECT l.*, r.rank FROM ${collection} l LEFT JOIN (
        SELECT "guildId", "userId", ROW_NUMBER() OVER(ORDER BY exp DESC) AS rank FROM ${collection} WHERE "guildId" = '${guildId}'
      ) AS r ON l."userId" = r."userId" AND l."guildId" = r."guildId"
      WHERE l."guildId" = '${guildId}'
      LIMIT ${count}
    `, Levels)
  }

  public static async addExp(guildId: string, userId: string, exp: number) {
    await Levels.add({ guildId, userId, exp: 0 }).catch(e => logger.debug(e.message))
    return super.fetchOne<Levels>(`
      UPDATE ${collection}
      SET exp = exp + ${exp}
      WHERE "guildId" = '${guildId}'
      AND "userId" = '${userId}'
    `, Levels)
  }

  public static async removeExp(guildId: string, userId: string, exp: number) {
    await Levels.add({ guildId, userId, exp: 0 }).catch(e => logger.debug(e.message))
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