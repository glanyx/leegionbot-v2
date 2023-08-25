import schedule from 'node-schedule'
import { Client, Guild, Role } from 'discord.js'

import { Birthday, GuildSetting } from '../db/models'
import { IActionType, IRoleAction } from './roleManager'

export class BirthdayManager {

  private client: Client

  constructor(client: Client) {

    this.client = client

    // Remove yesterday
    schedule.scheduleJob('59 59 23 * * *', () => {
      this.getBirthdays().then(({ items: birthdays }) => {
        const guildIds = new Set(birthdays.map(b => b.guildId))

        guildIds.forEach(async gid => {
          const guild = this.client.guilds.cache.get(gid) || await this.client.guilds.fetch(gid)
          const setting = await GuildSetting.fetchByGuildId(gid)
          if (!setting) return

          const { birthdayRoleId } = setting
          const role = guild.roles.cache.get(birthdayRoleId) || await guild.roles.fetch(birthdayRoleId)
          if (!role) return

          const memberIds = birthdays.filter(b => b.guildId === gid).map(b => b.userId)
          this.assignRoles(guild, role, memberIds, IRoleAction.REMOVE)
        })
      })
    })

    // Assign today
    schedule.scheduleJob('0 0 * * *', () => {
      this.getBirthdays().then(({ items: birthdays }) => {
        const guildIds = new Set(birthdays.map(b => b.guildId))

        guildIds.forEach(async gid => {
          const guild = this.client.guilds.cache.get(gid) || await this.client.guilds.fetch(gid)
          const setting = await GuildSetting.fetchByGuildId(gid)
          if (!setting) return

          const { birthdayRoleId } = setting
          const role = guild.roles.cache.get(birthdayRoleId) || await guild.roles.fetch(birthdayRoleId)
          if (!role) return

          const memberIds = birthdays.filter(b => b.guildId === gid).map(b => b.userId)
          this.assignRoles(guild, role, memberIds, IRoleAction.ADD)
        })
      })
    })

  }

  private getBirthdays = () => {
    return Birthday.fetchToday()
  }

  private assignRoles = (guild: Guild, role: Role, memberIds: Array<string>, action: IRoleAction) => {
    memberIds.forEach(async mid => {
      const member = guild.members.cache.get(mid) || await guild.members.fetch(mid)
      this.client.roleManager.add(member, role, action, IActionType.MANUAL)
    })
  }



}