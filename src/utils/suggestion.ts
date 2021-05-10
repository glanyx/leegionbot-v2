import { MessageEmbed, User } from 'discord.js'
import { Suggestion } from '../db/models'

export enum SuggestionStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  DECLINED = 'declined'
}

export const SuggestionState = {
  FINAL: [SuggestionStatus.COMPLETED, SuggestionStatus.DECLINED],
  PENDING: [SuggestionStatus.SUBMITTED, SuggestionStatus.APPROVED]
}

interface SuggestionArgs {
  user?: User,
  editor?: User,
  mod?: User,
  suggestion: Suggestion
}

export const updateSuggestion = (args: SuggestionArgs) => {

  const { user, suggestion } = args

  const embed = new MessageEmbed()
    .setDescription(suggestion.updatedText || suggestion.text)
    .setFooter(`Suggestion ID: ${suggestion.id}`)
    .addField('Status', `${suggestion.status.capitalize()}`, true)

  if (user) {
    embed.setTitle(`Suggestion by ${user.username}#${user.discriminator}`)
    embed.addField('Author', `<@${user}>`, true)
  } else {
    embed.setTitle(`Suggestion by ${suggestion.userId}`)
    embed.addField('Author', `<@${suggestion.userId}>`, true)
  }
  if (args.editor) embed.addField(`Edited by`, `<@${args.editor.id}>`, true)
  if (args.mod) embed.addField(`${args.suggestion.status.capitalize()} by`, `<@${args.mod.id}>`, true)
  if (args.suggestion.reason) embed.addField('Comment', args.suggestion.reason)

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