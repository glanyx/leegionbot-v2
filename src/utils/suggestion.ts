import { MessageEmbed, User } from 'discord.js'
import { Suggestion } from '../db/models'

export enum SuggestionStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  DECLINED = 'declined'
}

interface SuggestionArgs {
  user: User,
  editor?: User,
  mod?: User,
  suggestion: Suggestion
}

export const updateSuggestion = (args: SuggestionArgs) => {

  const embed = new MessageEmbed()
    .setTitle(`Suggestion by ${args.user.username}#${args.user.discriminator}`)
    .setDescription(args.suggestion.text)
    .setFooter(`Suggestion ID: ${args.suggestion.id}`)
    .addField('Status', `${args.suggestion.status.capitalize()}`, true)
    .addField('Author', `<@${args.user}>`, true)

  if (args.editor) embed.addField(`Edited by`, `<@${args.editor.id}>`, true)
  if (args.mod) embed.addField(`${args.suggestion.status.capitalize()} by`, `<@${args.mod.id}>`, true)

  switch (args.suggestion.status) {
    case SuggestionStatus.SUBMITTED:
      embed.setColor('#AAAAAA')
      break
    case SuggestionStatus.APPROVED:
      embed.setColor('#FFA500')
      break
    case SuggestionStatus.COMPLETED:
      embed.setColor('#00FF00')
      break
    case SuggestionStatus.DECLINED:
      embed.setColor('#FF0000')
      break
    default:
      embed.setColor('#AAAAAA')
  }

  return embed
}