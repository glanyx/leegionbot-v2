import { DBModel } from '../db-model'
import { logger } from '../../utils'

interface BirthdayProps extends BirthdayArgs {
}

interface BirthdayArgs {
  guildId: string
  userId: string
  day: number
  month: number
  year?: number
}

const collection = 'birthdays'

export class Birthday extends DBModel<BirthdayProps> {

  public collection = collection

  public static async add(bday: BirthdayArgs) {
    return super.create<Birthday>(`
      INSERT INTO ${collection} ("guildId", "userId", day, month, year) VALUES (
        '${bday.guildId}',
        '${bday.userId}',
        ${bday.day},
        ${bday.month},
        ${bday.year ? bday.year : null}
      )
    `, Birthday)
  }

  public static fetchForDay(day: number, month: number) {
    return super.query<Birthday>(`
      SELECT * FROM ${collection}
        WHERE day = ${day}
        AND  month = ${month}
    `, Birthday)
  }

  public static fetchToday() {
    const today = new Date()
    const day = today.getDate()
    const month = today.getMonth() + 1
    return super.query<Birthday>(`
      SELECT * FROM ${collection}
        WHERE day = ${day}
        AND  month = ${month}
    `, Birthday)
  }

  public get userId() {
    return this.data.userId
  }

  public get guildId() {
    return this.data.guildId
  }

  public get day() {
    return this.data.day
  }

  public get month() {
    return this.data.month
  }

  public get year() {
    return this.data.year
  }

}