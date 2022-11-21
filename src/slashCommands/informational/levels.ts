import { PermissionFlagsBits, GuildMember } from "discord.js"
import { Levels as LevelsModel } from '../../db/models'
import { levels, Paginator } from '../../utils'
import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'

const desc = 'Displays the top 50 users in the ranking.'

const data = new SlashCommandBuilder()
  .setName('levels')
  .setDescription(desc)
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
  .setDMPermission(false)

export class Levels extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { user, guild } = interaction
    if (!guild) return

    const { items: userLevels } = await LevelsModel.fetchTop(guild.id, 50)
    if (!userLevels.map(u => u.userId).includes(user.id)) {
      const reqUser = await LevelsModel.fetchUserData(guild.id, user.id)
      if (reqUser) userLevels.splice(49, 1, reqUser)
    }

    await guild.members.fetch({
      user: userLevels.map(u => u.userId)
    })

    const withLevels = userLevels.map(ul => {
      return {
        totalExp: ul.exp,
        level: ul ? levels.findIndex(l => l > ul.exp) - 1 : 0,
        member: guild.members.cache.get(ul.userId) as GuildMember
      }
    })

    const userNames = withLevels.map(u => `${u.member.nickname || u.member.user.username}`)
    const longest = userNames.reduce(
      (long: number, str: string) => Math.max(long, str.length),
      0
    )

    const userStrings = withLevels.map((item, index) => {
      const entry = `
        ${index + 1}${index < 9 && ' '}    ${item.member}${" ".repeat(longest - (item.member.nickname || item.member.user.username).length)}   ${item.level}      ${item.totalExp}
      `
      if (item.member.id === user.id) return `**${entry}**`
      return entry
    })

    const header = `**Rank   User${" ".repeat(longest - 4)}   Level   Total EXP**`

    userStrings.splice(40, 0, header)
    userStrings.splice(30, 0, header)
    userStrings.splice(20, 0, header)
    userStrings.splice(10, 0, header)
    userStrings.splice(0, 0, header)

    new Paginator(interaction, {
      title: 'Top 50 Members',
      author: user,
      items: [userStrings],
      displayCount: 11,
    })

  }
}