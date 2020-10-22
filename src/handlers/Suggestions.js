import * as uuid from 'uuid';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const SuggestionsMap = new Map();

export class Suggestion {

  /**
   * @param {string} description
   * @param {string} userId
   * @param {string} messageId
   * @param {string} guildId
   */
  constructor(description, userId, messageId, guildId){
    this.suggestionId = uuid.v1(),
    this.description = description,
    this.userId = userId,
    this.status = 'Submitted',
    this.messageId = messageId,
    this.guildId = guildId
  }

  async create() {
    const params = {
      TableName: "lb-suggestions",
      Item: {
        ...this,
        createdAt: Date.now()
      }
    };

    try {
      await dynamoDbLib.call("put", params);
    } catch (e) {
      console.log(e);
      new Error(
        `Oops, it seems I can't store your data right now. Please try again in a minute or contact my owner!`
      );
    }

    if (!SuggestionsMap.has(this.guildId)) {
      SuggestionsMap.set(this.guildId, { suggestions: [] });
    }

    const guild = SuggestionsMap.get(this.guildId);
    guild.suggestions.push(this);

    return this;
  }

}