import { Command, GuildMember, User } from 'discord.js'

export const hasPerms = (command: Command, member: GuildMember, owner: User) => {

  if (command.configs && member.user !== owner) {

    if (command.configs.ownerOnly && member.user !== owner) return false

    if (command.configs.permissions && member) {
      if (command.configs.permissions.filter(perm => member.hasPermission(perm)).length === 0) {
        return false
      }
    }
  }
  
  return true
}