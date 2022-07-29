import { SlashCommandHelp, SlashCommandProps } from 'discord.js'

interface TestResponse {

}

const help: SlashCommandHelp = {
  name: 'test',
  category: 'test',
}

export class Test {

  public static async execute({
    client,
    interaction,
  }: SlashCommandProps) {

  }

  public static get help() {
    return help
  }

}