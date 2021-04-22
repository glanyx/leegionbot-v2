import { Client } from 'discord.js'
import { logger } from '../utils'

export class Warn {

  public static async execute(_: Client, warning: string) {
    logger.warn(warning)
  }

}