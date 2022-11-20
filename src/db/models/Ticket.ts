import { DBModel } from '../db-model'
import { TicketMessage } from './TicketMessage'

interface ITicket extends ITicketArgs {
  id: number
  guildTicketId: number
  active: boolean
  closedAt?: Date
  closeReason?: string
}

interface ITicketArgs {
  guildId: string
  channelId: string
  memberId: string
}

const collection = 'ticket'

export class Ticket extends DBModel<ITicket> {

  public collection = collection

  public static async storeNew({
    guildId,
    channelId,
    memberId,
  }: ITicketArgs) {
    return super.create<Ticket>(`
      INSERT INTO ${collection} ("guildTicketId", "guildId", "channelId", "memberId") VALUES (
        (SELECT COALESCE(MAX("guildTicketId"), 0) FROM ${collection} WHERE "guildId" = '${guildId}') + 1,
        '${guildId}',
        '${channelId}',
        '${memberId}'
      )
    `, Ticket)
  }

  public static async fetchAll() {
    return super.query<Ticket>(`
      SELECT * FROM ${collection}
    `, Ticket)
  }

  public static async fetchAllActive() {
    return super.query<Ticket>(`
      SELECT * FROM ${collection}
      WHERE active = ${true}
    `, Ticket)
  }

  public static async fetchAllGuild(guildId: string) {
    return super.fetchOne<Ticket>(`
      SELECT * FROM ${collection}
      WHERE "guildId" = '${guildId}'
      AND active = ${true}
    `, Ticket)
  }

  public static async fetchSingle(guildId: string, id: number) {
    return super.fetchOne<Ticket>(`
      SELECT * FROM ${collection}
      WHERE id = ${id}
      AND "guildId" = '${guildId}'
    `, Ticket)
  }

  public async update() {
    return super.edit<Ticket>(`
      UPDATE ${collection}
      SET
        active = ${this.data.active},
        "closeReason" = '${this.data.closeReason ? this.data.closeReason.replace(/'/g, "''") : 'None provided'}',
        "closedAt" = ${this.data.closedAt ? `to_timestamp(${this.data.closedAt.getTime()} / 1000.0)` : null}
      WHERE id = ${this.data.id}
    `, Ticket)
  }

  public get id() {
    return this.data.id
  }

  public get guildTicketId() {
    return this.data.guildTicketId
  }

  public get guildId() {
    return this.data.guildId
  }

  public get channelId() {
    return this.data.channelId
  }

  public get memberId() {
    return this.data.memberId
  }

  public get active() {
    return this.data.active
  }

  public setActive = (active: boolean) => {
    this.data.active = active
    return this
  }

  public get closedAt() {
    return this.data.closedAt
  }

  public setClosedAt = (timestamp: Date) => {
    this.data.closedAt = timestamp
    return this
  }

  public get closeReason() {
    return this.data.closeReason
  }

  public setReason = (reason: string) => {
    this.data.closeReason = reason
    return this
  }

  public fetchMessages = () => {
    return TicketMessage.fetchByConversation(this.data.id)
  }

}