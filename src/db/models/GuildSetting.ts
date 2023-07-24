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
  twitterAnnounceChannelId: string
  twitchAnnounceChannelId: string
  twitchMentionId: string
  twitchFeeds: Array<string>
  patreonAnnounceChannelId: string
  ticketCategoryId: string
  ticketMentionRoleIds: Array<string>
  voteChannels: Array<string>
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

  public static async fetchTwitchTrackers() {
    return super.query<GuildSetting>(`
      SELECT * FROM ${collection}
      WHERE cardinality("twitchFeeds") > 0
    `, GuildSetting)
  }

  public static async fetchVoteTrackers() {
    return super.query<GuildSetting>(`
      SELECT * FROM ${collection}
      WHERE cardinality("voteChannelIds") > 0
    `, GuildSetting)
  }

  public async update() {
    const temp = `
      UPDATE ${collection} SET
        "mutedRoleId" = ${this.data.mutedRoleId ? `'${this.data.mutedRoleId}'` : null},
        "messageLogChannelId" = ${this.data.messageLogChannelId ? `'${this.data.messageLogChannelId}'` : null},
        "memberLogChannelId" = ${this.data.memberLogChannelId ? `'${this.data.memberLogChannelId}'` : null},
        "modLogChannelId" = ${this.data.modLogChannelId ? `'${this.data.modLogChannelId}'` : null},
        "suggestionChannelId" = ${this.data.suggestionChannelId ? `'${this.data.suggestionChannelId}'` : null},
        "twitterAnnounceChannelId" = ${this.data.twitterAnnounceChannelId ? `'${this.data.twitterAnnounceChannelId}'` : null},
        "twitchAnnounceChannelId" = ${this.data.twitchAnnounceChannelId ? `'${this.data.twitchAnnounceChannelId}'` : null},
        "twitchMentionId" = ${this.data.twitchMentionId ? `'${this.data.twitchMentionId}'` : null},
        "patreonAnnounceChannelId" = ${this.data.patreonAnnounceChannelId ? `'${this.data.patreonAnnounceChannelId}'` : null},
        "ticketCategoryId" = ${this.data.ticketCategoryId ? `'${this.data.ticketCategoryId}'` : null},
        "ticketMentionRoleIds" = ARRAY[${!this.data.ticketMentionRoleIds ? [] : this.data.ticketMentionRoleIds.map(t => `'${t}'`).join(',')}]::text[],
        "alertOnAction" = ${this.data.alertOnAction},
        "twitchFeeds" = ARRAY[${!this.data.twitchFeeds ? [] : this.data.twitchFeeds.map(t => `'${t}'`).join(',')}]::text[],
        blacklist = ARRAY[${!this.data.blacklist ? [] : this.data.blacklist.map(w => `'${w}'`).join(',')}]::text[]
      WHERE "guildId" = '${this.data.guildId}'
    `
    console.log(temp)
    return super.edit<GuildSetting>(temp, GuildSetting)
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

  public get twitterAnnounceChannelId() {
    return this.data.twitterAnnounceChannelId
  }

  public setTwitterAnnounceChannelId(id: string) {
    this.data.twitterAnnounceChannelId = id
    return this
  }

  public get twitchAnnounceChannelId() {
    return this.data.twitchAnnounceChannelId
  }

  public setTwitchAnnounceChannelId(id: string) {
    this.data.twitchAnnounceChannelId = id
    return this
  }

  public get twitchMentionId() {
    return this.data.twitchMentionId
  }

  public setTwitchMentionId(id: string) {
    this.data.twitchMentionId = id
    return this
  }

  public get twitchFeeds() {
    return this.data.twitchFeeds
  }

  public addTwitchFeed(channelname: string) {
    this.data.twitchFeeds.push(channelname)
  }

  public get patreonAnnounceChannelId() {
    return this.data.patreonAnnounceChannelId
  }

  public setPatreonAnnounceChannelId(id: string) {
    this.data.patreonAnnounceChannelId = id
    return this
  }

  public get ticketCategoryId() {
    return this.data.ticketCategoryId
  }

  public setTicketCategoryId(id: string) {
    this.data.ticketCategoryId = id
    return this
  }

  public get ticketMentionRoleIds() {
    return this.data.ticketMentionRoleIds
  }

  public addTicketMentionRoleIds(id: string) {
    this.data.ticketMentionRoleIds.push(id)
    return this
  }

  public get voteChannels() {
    return this.data.voteChannels
  }

  public addVoteChannel(id: string) {
    this.data.voteChannels.push(id)
    return this
  }

}