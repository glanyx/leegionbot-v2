import { DBModel } from '../db-model'

interface ICountdown extends INewCountdown {
  id: number
  active: boolean
}

interface INewCountdown {
  guildId: string
  channelId: string
  time: Date
  name: string
}

const collection = 'countdowns'

export class Countdown extends DBModel<ICountdown> {

  public collection = collection

  public static async storeNewTimer(countdown: INewCountdown) {
    return super.create<Countdown>(`
      INSERT INTO ${collection} ("guildId", "channelId", time, name) VALUES (
        '${countdown.guildId}',
        '${countdown.channelId}',
        to_timestamp(${countdown.time.getOffsetTime()} / 1000.0),
        '${countdown.name}'
      )
    `, Countdown)
  }

  public static async fetchById(id: number) {
    return super.fetchOne<Countdown>(`
      SELECT * FROM ${collection}
      WHERE id = ${id}
    `, Countdown)
  }

  public static async fetchByChannelId(channelId: string) {
    return super.fetchOne<Countdown>(`
      SELECT * FROM ${collection}
      WHERE "channelId" = '${channelId}'
    `, Countdown)
  }

  public static async fetchByGuildId(guildId: string) {
    return super.query<Countdown>(`
      SELECT * FROM ${collection}
      WHERE "guildId" = '${guildId}'
    `, Countdown)
  }

  public static async fetchAllActive() {
    return super.query<Countdown>(`
      SELECT * FROM ${collection}
      WHERE active = ${true}
    `, Countdown)
  }

  public async update() {
    return super.edit<Countdown>(`
      UPDATE ${collection} SET
        "active" = ${this.data.active}
      WHERE "channelId" = '${this.channelId}'
    `, Countdown)
  }

  public get id() {
    return this.data.id
  }

  public get guildId() {
    return this.data.guildId
  }

  public get channelId() {
    return this.data.channelId
  }

  public get time() {
    return this.data.time
  }

  public get name() {
    return this.data.name
  }

  public get active() {
    return this.data.active
  }

  public deactivate() {
    this.data.active = false
    return this
  }

}