import { GuildMember, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'

import { Birthday as BirthdayModel } from "../../../db/models"

const desc = 'Sets your birthday. A Happy Birthday role will be assigned to you on your birthday.'

const data = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription(desc)
  .addNumberOption(option =>
    option
      .setName('day')
      .setDescription('The day for your date of birth.')
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName('month')
      .setDescription('The month for your date of birth.')
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName('year')
      .setDescription('The year for your date of birth. (Optional)')  
  )
  .setDMPermission(false)

export class Birthday extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { member, guild } = interaction

    if (!member || !guild) return
    
    const day = (interaction.options.get('day')?.value as number | undefined) || 0
    const month = (interaction.options.get('month')?.value as number | undefined) || 0
    const year = (interaction.options.get('year')?.value as number | undefined)

    await BirthdayModel.add({
      guildId: guild.id,
      userId: member.user.id,
      day,
      month,
      year
    }).then(() => {
      interaction.editReply('Your birthday was set!')
    }).catch(e => {
      interaction.editReply('There was a problem setting your birthday. Please try again later.')
    })

  }
}