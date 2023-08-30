import schedule from 'node-schedule'
import { Client, Guild } from 'discord.js'

import { Birthday, GuildSetting } from '../db/models'
import { IActionType, IRoleAction } from './roleManager'

export class BirthdayManager {

  private client: Client

  constructor(client: Client) {

    this.client = client

    // Remove yesterday
    schedule.scheduleJob('55 59 23 * * *', () => {

      this.getBirthdays().then(({ items: birthdays }) => {
        const guildIds = new Set(birthdays.map(b => b.guildId))

        guildIds.forEach(async gid => {
          const guild = client.guilds.cache.get(gid) || await client.guilds.fetch(gid)
          const memberIds = birthdays.filter(b => b.guildId === gid).map(b => b.userId)
          BirthdayManager.assignRoles(this.client, guild, memberIds, IRoleAction.ADD)
        })
      })

    })

    // Assign today
    schedule.scheduleJob('0 0 * * *', () => {
      this.getBirthdays().then(({ items: birthdays }) => {
        const guildIds = new Set(birthdays.map(b => b.guildId))

        guildIds.forEach(async gid => {
          const guild = client.guilds.cache.get(gid) || await client.guilds.fetch(gid)
          const memberIds = birthdays.filter(b => b.guildId === gid).map(b => b.userId)
          BirthdayManager.assignRoles(this.client, guild, memberIds, IRoleAction.ADD)
        })
      })
    })

  }

  public getBirthdays = () => {
    return Birthday.fetchToday()
  }

  private static getRole = async (guild: Guild) => {

    const setting = await GuildSetting.fetchByGuildId(guild.id)
    if (!setting) return

    const { birthdayRoleId } = setting
    return guild.roles.cache.get(birthdayRoleId) || await guild.roles.fetch(birthdayRoleId)
  }

  public static assignRoles = async (client: Client, guild: Guild, memberIds: Array<string>, action: IRoleAction) => {

    const role = await BirthdayManager.getRole(guild)
    if (!role) return

    memberIds.forEach(async mid => {
      const member = guild.members.cache.get(mid) || await guild.members.fetch(mid)
      client.roleManager.add(member, role, action, IActionType.MANUAL)
    })

  }

}

export const test = () => {
  
}