import { DBModel } from '../db-model'

interface IGuildSetting extends INewGuildSetting {
  id: number
  alertOnAction: boolean
  blacklist: Array<string>
  mutedRoleId: string
  messageLogChannelId: string
  memberLogChannelId: string
  modLogChannelId: string
  messageLimit: number
  messageTimeframe: number
  muteDuration: number
  suggestionChannelId: string
  announcementChannelId: string
  ticketChannelId: string
}

interface INewGuildSetting {
  guildId: string
}

const collection = 'guildsettings'

export class GuildSetting extends DBModel<IGuildSetting> {

  public collection = collection

  public static async add(guildId: string) {
    return super.create<GuildSetting>(`
      INSERT INTO ${collection} ("guildId")
      SELECT '${guildId}'
      WHERE NOT EXISTS (
        SELECT 1 FROM ${collection} WHERE "guildId" = '${guildId}'
      )
    `, GuildSetting)
  }

  public static async fetchByGuildId(guildId: string) {
    return super.fetchOne<GuildSetting>(`
      SELECT * FROM ${collection}
      WHERE "guildId" = '${guildId}'
    `, GuildSetting)
  }

  public async update() {
    return super.edit<GuildSetting>(`
      UPDATE ${collection} SET
        "mutedRoleId" = ${this.data.mutedRoleId ? `'${this.data.mutedRoleId}'` : null},
        "messageLogChannelId" = ${this.data.messageLogChannelId ? `'${this.data.messageLogChannelId}'` : null},
        "memberLogChannelId" = ${this.data.memberLogChannelId ? `'${this.data.memberLogChannelId}'` : null},
        "modLogChannelId" = ${this.data.modLogChannelId ? `'${this.data.modLogChannelId}'` : null},
        "suggestionChannelId" = ${this.data.suggestionChannelId ? `'${this.data.suggestionChannelId}'` : null},
        "announcementChannelId" = ${this.data.announcementChannelId ? `'${this.data.announcementChannelId}'` : null},
        "ticketChannelId" = ${this.data.ticketChannelId ? `'${this.data.ticketChannelId}'` : null},
        "alertOnAction" = ${this.data.alertOnAction},
        blacklist = ARRAY[${this.data.blacklist.join(',')}]::text[]
      WHERE "guildId" = '${this.data.guildId}'
    `, GuildSetting)
  }

  public get id() {
    return this.data.id
  }

  public get guildId() {
    return this.data.guildId
  }

  public get alertOnAction() {
    return this.data.alertOnAction
  }

  public enableAlerts() {
    this.data.alertOnAction = true
    return this
  }

  public disableAlerts() {
    this.data.alertOnAction = false
    return this
  }

  public get mutedRoleId() {
    return this.data.mutedRoleId
  }

  public setMutedRole(id: string) {
    this.data.mutedRoleId = id
    return this
  }

  public get messageLogChannelId() {
    return this.data.messageLogChannelId
  }

  public setMessageLogChannel(id: string) {
    this.data.messageLogChannelId = id
    return this
  }

  public get memberLogChannelId() {
    return this.data.memberLogChannelId
  }

  public setMemberLogChannel(id: string) {
    this.data.memberLogChannelId = id
    return this
  }

  public get modLogChannelId() {
    return this.data.modLogChannelId
  }

  public setModLogChannel(id: string) {
    this.data.modLogChannelId = id
    return this
  }

  public get blacklist() {
    return this.data.blacklist
  }

  public addToBlacklist(data: string | Array<string>) {
    if (typeof data === 'string') {
      this.data.blacklist.push(data)
    } else {
      data.forEach(item => this.data.blacklist.push(item))
    }
    return this
  }

  public removeFromBlacklist(item: string) {
    this.data.blacklist = this.data.blacklist.filter(blacklistItem => blacklistItem !== item)
    return this
  }

  public get messageLimit() {
    return this.data.messageLimit
  }

  public setMessageLimit(limit: number) {
    this.data.messageLimit = limit
    return this
  }

  public get messageTimeframe() {
    return this.data.messageTimeframe
  }

  public setMessageTimeframe(timeframe: number) {
    this.data.messageTimeframe = timeframe
    return this
  }

  public get muteDuration() {
    return this.data.muteDuration
  }

  public setMuteDuration(duration: number) {
    this.data.muteDuration = duration
    return this
  }

  public get suggestionChannelId() {
    return this.data.suggestionChannelId
  }

  public setSuggestionChannelId(id: string) {
    this.data.suggestionChannelId = id
    return this
  }

  public get announcementChannelId() {
    return this.data.announcementChannelId
  }

  public setAnnouncementChannelId(id: string) {
    this.data.announcementChannelId = id
    return this
  }

  public get ticketChannelId() {
    return this.data.ticketChannelId
  }

  public setTicketChannelId(id: string) {
    this.data.ticketChannelId = id
    return this
  }

}