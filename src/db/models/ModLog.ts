import { DBModel } from '../db-model'

export enum ModeratorAction {
  BAN = 'ban',
  KICK = 'kick',
  MUTE = 'mute',
  WARN = 'warn'
}

interface INewModLog {
  guildId: string
  userId: string
  targetId: string
  action: ModeratorAction
  reason: string
  muteTime?: Date
}

interface IModLog extends INewModLog {
  id: number
  time: Date
  muteActive: boolean
}

const collection = 'modlogs'

export class ModLog extends DBModel<IModLog> {

  public collection = collection

  public static async storeNewAction(action: INewModLog) {
    return super.create<ModLog>(`
      INSERT INTO ${collection} ("guildId", "userId", "targetId", action, reason, "muteTime", "muteActive") VALUES (
        '${action.guildId}',
        '${action.userId}',
        '${action.targetId}', 
        ${action.action}',
        '${action.reason.replace(/'/g, "''")}',
        ${action.muteTime ? `to_timestamp(${action.muteTime.getOffsetTime()} / 1000.0)` : null},
        ${action.muteTime ? true : null}
      )
    `, ModLog)
  }

  public static async fetchById(id: number) {
    return super.fetchOne<ModLog>(`
      SELECT * FROM ${collection}
      WHERE id = ${id}
    `, ModLog)
  }

  public static async fetchByGuildId(guildId: string) {
    return super.query<ModLog>(`
      SELECT * FROM ${collection}
      WHERE "guildId" = '${guildId}'
    `, ModLog)
  }

  public static async fetchByUserId(guildId: string, userId: string, action?: ModeratorAction) {
    return super.query<ModLog>(`
      SELECT * FROM ${collection}
        WHERE "targetId" = '${userId}'
        AND "guildId" = '${guildId}'
        ${action ? `AND "action" = '${action}'` : ''}
        ORDER BY time DESC
    `, ModLog)
  }

  public static async fetchActiveUserMute(guildId: string, userId: string) {
    return super.fetchOne<ModLog>(`
      SELECT * FROM ${collection}
        WHERE "targetId" = '${userId}'
        AND "guildId" = '${guildId}'
        AND action = '${ModeratorAction.MUTE}'
        AND "muteActive" = ${true}
    `, ModLog)
  }

  public static async fetchActiveMutes(guildId?: string) {
    return super.query<ModLog>(`
      SELECT * FROM ${collection}
      WHERE action = '${ModeratorAction.MUTE}'
      AND "muteActive" = ${true}
      ${guildId ? `AND "guildId" = '${guildId}'` : ''}
    `, ModLog)
  }
  
  public async update() {
    return super.edit<ModLog>(`
      UPDATE ${collection} SET
        "muteActive" = ${this.data.muteActive}
      WHERE id = '${this.data.id}'
    `, ModLog)
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

  public get targetId() {
    return this.data.targetId
  }

  public get action() {
    return this.data.action
  }

  public get reason() {
    return this.data.reason
  }

  public get time() {
    return this.data.time
  }

  public get muteTime() {
    return this.data.muteTime
  }

  public get muteActive() {
    return this.data.muteActive
  }

  public unmute() {
    this.data.muteActive = false
    return this
  }

}