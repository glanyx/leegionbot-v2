import { Help, Config, IExecuteArgs, TextChannel, MessageEmbed } from "discord.js"
import { Suggestion as SuggestionModel, GuildSetting } from '../../db/models'
import { updateSuggestion, SuggestionStatus, SuggestionState, Paginator, logger } from '../../utils'


const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

const help: Help = {
  name: "suggestion",
  category: "Features",
  description: "Creates a new suggestion.",
  usage: "suggestion [Text]",
  example: [
    'suggestion This is my suggestion!',
  ]
}

const alias = ['sg', 'suggest']

export class Suggestion {

  public static async run({
    message,
    content
  }: IExecuteArgs) {

    const { guild, author } = message
    if (!guild) return

    message.delete()

    if (!content || content === '') return message.channel.send('Please add some text for your suggestion!').then(msg => setTimeout(() => msg.delete(), 5000))

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    const channel = (settings && settings.suggestionChannelId ? await guild.channels.cache.get(settings.suggestionChannelId)?.fetch() || message.channel : message.channel) as TextChannel

    SuggestionModel.addSuggestion({
      guildId: guild.id,
      channelId: channel.id,
      text: content,
      userId: author.id
    }).then(suggestion => {
      const embed = updateSuggestion({
        user: author,
        suggestion,
      })
      channel.send({ embeds: [embed] }).then(msg => suggestion.setMessageId(msg.id).update())
      message.channel.send(`Thanks for your suggestion, <@${author}>! You can find your suggestion in <#${channel}>`)
    })

  }

  public static get subcommands() {
    return [Edit, Approve, Complete, Decline, List]
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

  public static get alias() {
    return alias
  }
}

const editHelp: Help = {
  name: "edit",
  category: "Features",
  description: "Edits an existing suggestion. Must be your own or have MANAGE MESSAGES permission to edit.",
  usage: "suggestion edit [id] (reason)",
  example: [
    'suggestion edit 1 I changed my mind.',
  ]
}

const editConfigs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

const editAlias = [
  'e'
]

class Edit {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member, author } = message
    if (!guild || !member) return

    const idText = args.shift()
    if (!idText) return channel.send('Please specify an ID to edit!').then(msg => setTimeout(() => msg.delete(), 5000))

    const id = parseInt(idText)
    if (isNaN(id)) return channel.send('Please specify a valid ID!').then(msg => setTimeout(() => msg.delete(), 5000))

    const text = args.join(' ')
    if (!text || text === '') return channel.send('Please enter some text to edit this suggestion with!').then(msg => setTimeout(() => msg.delete(), 5000))

    SuggestionModel.fetchById({
      id,
      guildId: guild.id
    }).then(async suggestion => {
      if (!suggestion) return channel.send('Unable to find a suggestion by the specified ID!').then(msg => setTimeout(() => msg.delete(), 5000))

      if (suggestion.userId !== author.id) {
        if (!member.permissions.has('MANAGE_MESSAGES')) return channel.send('You don\'t have the required permissions to edit this suggestion!').then(msg => setTimeout(() => msg.delete(), 5000))
      }
      
      suggestion
        .setUpdatedText(text)
        .setEditorId(author.id)

      const sgUser = await guild.members.fetch(suggestion.userId).catch(() => undefined)

      const sgChannel = guild.channels.cache.get(suggestion.channelId) as TextChannel
      if (!sgChannel) return
      await sgChannel.fetch()

      const sgMessage = await sgChannel.messages.fetch(suggestion.messageId)

      const embed = updateSuggestion({
        user: sgUser?.user,
        editor: author,
        suggestion
      })
      sgMessage.edit({ embeds: [embed] })
      .then(() => {

        suggestion.update()

        const updatedEmbed = new MessageEmbed()
          .setTitle('Suggestion Updated!')
          .setDescription(`Your suggestion has been updated! You can check the status of your suggestion [here](${sgMessage.url})!`)
        sgChannel.send({
          content: `<@${sgUser || suggestion.userId}>`,
          embeds: [updatedEmbed]
        })
        
        const successEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle('Success!')
          .setDescription('Suggestion edited successfully!')
        channel.send({ embeds: [successEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000))

      }).catch(e => {
        logger.debug(`Unable to update Suggestion ID ${suggestion.id}\n${e}`)
        channel.send('Unable to updated suggestion at this time. Please try again later.')
      })

    })

  }

  public static get help() {
    return editHelp
  }

  public static get configs() {
    return editConfigs
  }

  public static get alias() {
    return editAlias
  }

}

const approveHelp: Help = {
  name: "approve",
  category: "Features",
  description: "Approves the specified suggestion.",
  usage: "suggestion approve [id] (reason)",
  example: [
    'suggestion approve 1 Will do.',
  ]
}

const approveConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

const approveAlias = [
  'a'
]

class Approve {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member, author } = message
    if (!guild || !member) return

    const idText = args.shift()
    if (!idText) return channel.send('Please specify an ID to edit!').then(msg => setTimeout(() => msg.delete(), 5000))

    const id = parseInt(idText)
    if (isNaN(id)) return channel.send('Please specify a valid ID!').then(msg => setTimeout(() => msg.delete(), 5000))

    const reason = args.join(' ') || 'No reason provided'

    SuggestionModel.fetchById({
      id,
      guildId: guild.id
    }).then(async suggestion => {
      if (!suggestion) return channel.send('Unable to find a suggestion by the specified ID!').then(msg => setTimeout(() => msg.delete(), 5000))

      if (suggestion.status !== SuggestionStatus.SUBMITTED) return channel.send(`You can't approve a suggestion in ${suggestion.status} status!`).then(msg => setTimeout(() => msg.delete(), 5000))

      suggestion
        .setReason(reason)
        .setStatus(SuggestionStatus.APPROVED)
        .setModId(author.id)

      const sgUser = await guild.members.fetch(suggestion.userId).catch(() => undefined)

      const sgChannel = guild.channels.cache.get(suggestion.channelId) as TextChannel
      if (!sgChannel) return
      await sgChannel.fetch()

      const sgMessage = await sgChannel.messages.fetch(suggestion.messageId)

      const embed = updateSuggestion({
        user: sgUser?.user,
        mod: author,
        suggestion
      })
      sgMessage.edit({ embeds: [embed] })
      .then(() => {

        suggestion.update()

        const updatedEmbed = new MessageEmbed()
          .setTitle('Suggestion Updated!')
          .setDescription(`Your suggestion has been updated! You can check the status of your suggestion [here](${sgMessage.url})!`)
        sgChannel.send({
          content: `<@${sgUser || suggestion.userId}>`,
          embeds: [updatedEmbed],
        })
        
        const approveEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle('Success!')
          .setDescription('Suggestion approved!')
        channel.send({ embeds: [approveEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000))

      }).catch(e => {
        logger.debug(`Unable to update message for Suggestion ID ${suggestion.id}\n${e}`)
        channel.send('Unable to updated suggestion at this time. Please try again later.')
      })
    })

  }

  public static get help() {
    return approveHelp
  }

  public static get configs() {
    return approveConfigs
  }

  public static get alias() {
    return approveAlias
  }

}
const completeHelp: Help = {
  name: "complete",
  category: "Features",
  description: "Completes the specified suggestion.",
  usage: "suggestion complete [id] (reason)",
  example: [
    'suggestion complete 1 Done.',
  ]
}

const completeConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

const completeAlias = [
  'c'
]

class Complete {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member, author } = message
    if (!guild || !member) return

    const idText = args.shift()
    if (!idText) return channel.send('Please specify an ID to edit!').then(msg => setTimeout(() => msg.delete(), 5000))

    const id = parseInt(idText)
    if (isNaN(id)) return channel.send('Please specify a valid ID!').then(msg => setTimeout(() => msg.delete(), 5000))

    const reason = args.join(' ') || 'No reason provided'

    SuggestionModel.fetchById({
      id,
      guildId: guild.id
    }).then(async suggestion => {
      if (!suggestion) return channel.send('Unable to find a suggestion by the specified ID!').then(msg => setTimeout(() => msg.delete(), 5000))

      if (SuggestionState.FINAL.includes(suggestion.status)) return channel.send(`You can't complete a suggestion in ${suggestion.status} status!`).then(msg => setTimeout(() => msg.delete(), 5000))

      suggestion
        .setReason(reason)
        .setStatus(SuggestionStatus.COMPLETED)
        .setModId(author.id)

      const sgUser = await guild.members.fetch(suggestion.userId).catch(() => undefined)

      const sgChannel = guild.channels.cache.get(suggestion.channelId) as TextChannel
      if (!sgChannel) return
      await sgChannel.fetch()

      const sgMessage = await sgChannel.messages.fetch(suggestion.messageId)

      const embed = updateSuggestion({
        user: sgUser?.user,
        mod: author,
        suggestion
      })
      sgMessage.edit({ embeds: [embed] })
      .then(() => {

        suggestion.update()

        const updatedEmbed = new MessageEmbed()
          .setTitle('Suggestion Updated!')
          .setDescription(`Your suggestion has been updated! You can check the status of your suggestion [here](${sgMessage.url})!`)
        sgChannel.send({
          content: `<@${sgUser || suggestion.userId}>`,
          embeds: [updatedEmbed],
        })
        
        const completeEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle('Success!')
          .setDescription('Suggestion completed!')
        channel.send({ embeds: [completeEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000))

      }).catch(e => {
        logger.debug(`Unable to update message for Suggestion ID ${suggestion.id}\n${e}`)
        channel.send('Unable to updated suggestion at this time. Please try again later.')
      })
    })

  }

  public static get help() {
    return completeHelp
  }

  public static get configs() {
    return completeConfigs
  }

  public static get alias() {
    return completeAlias
  }

}

const declineHelp: Help = {
  name: "decline",
  category: "Features",
  description: "Declines the specified suggestion.",
  usage: "suggestion decline [id] (reason)",
  example: [
    'suggestion decline 1 Unable to do.',
  ]
}

const declineConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

const declineAlias = [
  'd'
]

class Decline {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member, author } = message
    if (!guild || !member) return

    const idText = args.shift()
    if (!idText) return channel.send('Please specify an ID to edit!').then(msg => setTimeout(() => msg.delete(), 5000))

    const id = parseInt(idText)
    if (isNaN(id)) return channel.send('Please specify a valid ID!').then(msg => setTimeout(() => msg.delete(), 5000))

    const reason = args.join(' ') || 'No reason provided'

    SuggestionModel.fetchById({
      id,
      guildId: guild.id
    }).then(async suggestion => {
      if (!suggestion) return channel.send('Unable to find a suggestion by the specified ID!').then(msg => setTimeout(() => msg.delete(), 5000))

      if (SuggestionState.FINAL.includes(suggestion.status)) return channel.send(`You can't decline a suggestion in ${suggestion.status} status!`).then(msg => setTimeout(() => msg.delete(), 5000))

      suggestion
        .setReason(reason)
        .setStatus(SuggestionStatus.DECLINED)
        .setModId(author.id)

      const sgUser = await guild.members.fetch(suggestion.userId).catch(() => undefined)

      const sgChannel = guild.channels.cache.get(suggestion.channelId) as TextChannel
      if (!sgChannel) return
      await sgChannel.fetch()

      const sgMessage = await sgChannel.messages.fetch(suggestion.messageId)

      const embed = updateSuggestion({
        user: sgUser?.user,
        mod: author,
        suggestion
      })
      sgMessage.edit({ embeds: [embed] })
      .then(() => {

        suggestion.update()

        const updatedEmbed = new MessageEmbed()
          .setTitle('Suggestion Updated!')
          .setDescription(`Your suggestion has been updated! You can check the status of your suggestion [here](${sgMessage.url})!`)
        sgChannel.send({
          content: `<@${sgUser || suggestion.userId}>`,
          embeds: [updatedEmbed],
        })
        
        const declineEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle('Success!')
          .setDescription('Suggestion declined!')
        channel.send({ embeds: [declineEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000))

      }).catch(e => {
        logger.debug(`Unable to update message for Suggestion ID ${suggestion.id}\n${e}`)
        channel.send('Unable to updated suggestion at this time. Please try again later.')
      })
    })

  }

  public static get help() {
    return declineHelp
  }

  public static get configs() {
    return declineConfigs
  }

  public static get alias() {
    return declineAlias
  }

}

const listHelp: Help = {
  name: "list",
  category: "Features",
  description: "Lists pending suggestions on the server.",
  usage: "suggestion list",
  example: [
    'suggestion list',
  ]
}

const listConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

const listAlias = [
  'l'
]

class List {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member, author } = message
    if (!guild || !member) return

    SuggestionModel.fetchByGuildId(guild.id, true).then(({ items: suggestions }) => {

      if (suggestions.length === 0) return channel.send('There are no open suggestions!')

      new Paginator({
        title: 'Submitted or Approved Suggestions',
        channel,
        author,
        items: suggestions.map(sg => `**ID ${sg.id}**\n**Requested by:** <@${sg.userId}>\n**Status:** ${sg.status}\n**Suggestion:** ${sg.updatedText || sg.text}`),
        displayCount: 5
      })

    })

  }

  public static get help() {
    return listHelp
  }

  public static get configs() {
    return listConfigs
  }

  public static get alias() {
    return listAlias
  }

}