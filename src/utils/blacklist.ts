import { GuildSetting } from '../db/models'

const GuildBlacklist = new Map<string, Array<string>>()

export class Blacklist {

  public static async loadFromDB(guildId: string) {
    
    if (!GuildBlacklist.has(guildId)) {
      GuildBlacklist.set(guildId, [])
    }

    const settings = await GuildSetting.fetchByGuildId(guildId)
    if (!settings) return

    const { blacklist } = settings
    const list = GuildBlacklist.get(guildId) as Array<string>
    blacklist.forEach(word => list.push(word))
  }

  public static add(guildId: string, text: string) {

    if (!GuildBlacklist.has(guildId)) {
      GuildBlacklist.set(guildId, [])
    }

    const list = GuildBlacklist.get(guildId) as Array<string>

    if (!list.includes(text.toLowerCase())) {
      list.push(text.toLowerCase())
      GuildSetting.fetchByGuildId(guildId).then(setting => {
        if (!setting) return
        setting.addToBlacklist(text.toLowerCase()).update()
      })
    }
    
  }

  public static remove(guildId: string, text: string) {

    if (!GuildBlacklist.has(guildId)) return

    const list = GuildBlacklist.get(guildId) as Array<string>

    if (!list.includes(text.toLowerCase())) return
    const i = list.findIndex(item => item === text.toLowerCase())
    list.splice(i, 1)
    GuildSetting.fetchByGuildId(guildId).then(setting => {
      if (!setting) return
      setting.removeFromBlacklist(text.toLowerCase()).update()
    })
  }

  public static compare(guildId: string, text: string) {
    if (!GuildBlacklist.has(guildId)) return false
    const list = GuildBlacklist.get(guildId) as Array<string>

    const words = text
      .trim()
      .split(/ +/g)
      .map(word => word.toLowerCase())

    return list.map(item => item.trim().toLowerCase()).some(forbidden => {
      if (!forbidden.startsWith('*') && !forbidden.endsWith('*')) {
        return words.includes(forbidden)
      } else if (forbidden.startsWith('*') && forbidden.endsWith('*')) {
        return words.some(word => word.includes(forbidden.substring(1, forbidden.length - 1)))
      } else if (forbidden.startsWith('*')) {
        return words.some(word => word.endsWith(forbidden.substring(1)))
      } else if (forbidden.endsWith('*')) {
        return words.some(word => word.startsWith(forbidden.substring(0, forbidden.length - 1)))
      }
      return false
    })

  }

  public static list(guildId: string) {
    return GuildBlacklist.get(guildId)
  }
}