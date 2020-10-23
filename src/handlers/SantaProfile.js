import * as uuid from 'uuid';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const SantaProfileMap = new Map();

export class SantaServerProfile {

  /**
   * 
   * @param {string} guildId 
   */
  constructor(guildId) {
    this.enabled = true
    this.profiles = []

    SantaProfileMap.set(guildId, this)
  }

  storeToDb = async () => {

  }

  /**
   * @returns {boolean}
   */
  get enabled() {
    return this.enabled
  }
}

export class SantaProfile {

  consturctor() {

  }

  storeToDb = async () => {

  }
}