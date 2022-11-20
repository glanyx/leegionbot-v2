import { Help, Config, IExecuteArgs, PermissionFlagsBits } from "discord.js"
import { Blacklist as BlacklistHelper, OldPaginator } from "../../utils"

const help: Help = {
  name: "blacklist",
  category: "Moderation",
  description: "Base command for the blacklist feature. Items added to this list will automatically be removed if the member does not have the Manage Messages permission.",
  usage: "blacklist [text]",
  example: [
    'help blacklist'
  ]
}

const configs: Config = {
  permissions: [
    PermissionFlagsBits.ManageMessages
  ]
}

const alias = ['bl']

export class Blacklist {

  public static async run({
    message
  }: IExecuteArgs) {

    const { channel } = message;
    (channel as any).send("Please use subcommands to use this command!")

  }

  public static get subcommands() {
    return [Add, Delete, List]
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

const aConfigs: Config = {
  permissions: [
    PermissionFlagsBits.ManageGuild
  ]
}

const aHelp: Help = {
  name: "add",
  category: "Moderation",
  description: "Adds a word to the blacklist for this server.",
  usage: "blacklist add [text]",
  example: [
    'blacklist add poopie',
    'blacklist add bad',
  ]
}

const aAlias = ['a']

class Add {

  public static async run({
    message,
    content,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    if (!args[0]) return (channel as any).send('Please provided one or more words to blacklist!')

    let text: string = ''
    if (args.length > 1) {
      let start = false
      let end = false
      if (!content.startsWith('*')) start = true
      if (!content.endsWith('*')) end = true
      text = `${start ? '*' : ''}${content}${end ? '*' : ''}`

    } else {
      text = args[0]
    }

    BlacklistHelper.add(guild.id, text);
    (channel as any).send(`Added \`${text}\` to the blacklist!`)

  }

  public static get help() {
    return aHelp
  }

  public static get configs() {
    return aConfigs
  }

  public static get alias() {
    return aAlias
  }

}

const dHelp: Help = {
  name: "delete",
  category: "Moderation",
  description: "Deletes a word from the server's word blacklist.",
  usage: "blacklist delete [word]",
  example: [
    'blacklist delete poopie',
    'blacklist delete bad'
  ]
}

const dConfigs: Config = {
  permissions: [
    PermissionFlagsBits.ManageGuild
  ]
}

const dAlias = ['d', 'del']

class Delete {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    if (!args[0]) return (channel as any).send('Please provide a word to delete!')

    BlacklistHelper.remove(guild.id, args[0]);

    (channel as any).send('Deleted!')

  }

  public static get help() {
    return dHelp
  }

  public static get configs() {
    return dConfigs
  }

  public static get alias() {
    return dAlias
  }

}

const lHelp: Help = {
  name: "list",
  category: "Moderation",
  description: "Lists the current words blacklisted on the server.",
  usage: "blacklist list",
  example: [
    'blacklist list'
  ]
}

const lConfigs: Config = {
  permissions: [
    PermissionFlagsBits.ManageMessages
  ]
}

const lAlias = ['l']

class List {

  public static async run({
    message,
  }: IExecuteArgs) {

    const { guild, channel, author } = message
    if (!guild) return

    const items = BlacklistHelper.list(guild.id)

    if (!items || items.length === 0) return (channel as any).send('No words are currently blacklisted!')

    new OldPaginator({
      title: 'List of Blacklisted words',
      channel,
      author,
      items: items.map(item => `\`${item}\``),
      displayCount: 10
    })

  }

  public static get help() {
    return lHelp
  }

  public static get configs() {
    return lConfigs
  }

  public static get alias() {
    return lAlias
  }

}