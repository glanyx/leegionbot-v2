import { Client, RateLimitData } from 'discord.js'
import { logger } from '../utils'

export class RateLimit {

  public static async execute(_: Client, rateLimitInfo: RateLimitData) {
    logger.warn(`Rate Limit | Method: ${rateLimitInfo.method} | Limit: ${rateLimitInfo.limit} | Timeout: ${rateLimitInfo}ms`)
  }

}