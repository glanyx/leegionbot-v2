import * as dynamoDbLib from '../libs/dynamodb-lib'
import { User, MessageEmbed } from 'discord.js'
import { toTitleCase } from '../helpers'
import { countryLookup } from '../libs/address-lib'

export const SecretSantaMap = new Map<string, SantaServerProfile>()

export const getAllServerConfigs = async () => {
  const { Items } = await loadFromDb<IMultiResponse<SantaServerProfileResponse>>({
    TableName: 'LeegionBot_Santa_Server_Profiles'
  })

  await Promise.all(Items.map(async item => {
    const serverProfile = new SantaServerProfile(item.guildId, item.enabled)
    SecretSantaMap.set(item.guildId, serverProfile)
    await Promise.all(item.profiles.map(async profile => {
      const santaProfile = await new SantaProfile({ userId: profile, guildId: item.guildId }).load()
      serverProfile.profiles.set(santaProfile.profile.userId, santaProfile)
    }))
  }))
}

interface ISingleResponse<T> {
  Item: T
}

interface IMultiResponse<T> {
  Items: Array<T>
}

interface SantaServerProfileResponse {
  guildId: string
  enabled: boolean
  profiles: string[] 
}

export class SantaServerProfile {
  guildId: string
  enabled: boolean
  profiles: Map<string, SantaProfile>

  constructor(guildId: string, enabled?: boolean) {
    this.guildId = guildId
    this.enabled = enabled !== undefined ? enabled : true
    this.profiles = new Map<string, SantaProfile>()

    SecretSantaMap.set(guildId, this)
    return this
  }

  public enable() {
    this.enabled = true
    this.save()
    return this
  }

  public disable() {
    this.enabled = false
    this.save()
    return this
  }

  public addProfile (profile: SantaProfile) {
    this.profiles.set(profile.profile.userId, profile)
    this.save()
    return this
  }

  save = async () => {
    console.log('Saving Server Profile..')
    console.log('servermap:\n', this)
    console.log(`profiles:\n`, this.profiles)
    const profileList: string[] = []
    this.profiles.forEach(item => profileList.push(item.profile.userId))
    await saveToDb({
      TableName: 'LeegionBot_Santa_Server_Profiles',
      Item: {
        ...this,
        profiles: profileList,
        createdDate: Date.now()
      }
    })
  }

}

interface IProfile {
  userId: string
  guildId: string
  termsAndConditions?: boolean
  type?: SantaType
  //* Need to change Address to a type
  address?: IAddress
  postcode?: string
  themes?: string[]
  status?: SantaStatus
  targetId?: string
}

export class SantaProfile {
  profile: IProfile

  constructor(profile: IProfile) {
    this.profile = profile
    return this
  }

  public setTermsAndConditions(termsAndConditions: boolean) {
    this.profile.termsAndConditions = termsAndConditions
    return this
  }

  public setType(type?: SantaType) {
    this.profile.type = type
    return this
  }

  public setAddress(address?: IAddress) {
    this.profile.address = address
    return this
  }

  public setPostcode(postcode?: string) {
    this.profile.postcode = postcode
    return this
  }

  public setThemes(themes?: string[]) {
    this.profile.themes = themes
    return this
  }

  public setStatus(status?: SantaStatus) {
    this.profile.status = status
    return this
  }
  
  public setTarget(target: string) {
    this.profile.targetId = target
    return this
  }

  public addTheme(theme: string) {
    this.profile.themes ? this.profile.themes.push(theme) : this.profile.themes = [theme]
    return this
  }

  public createProfileEmbed(user: User) {

    let embed = new MessageEmbed()
      .setDescription(`This is the Secret Santa profile for <@${user.id}>.`)
      .setAuthor(user.username, user.avatarURL() || undefined)
      .setThumbnail(user.avatarURL() || '')
      .setTimestamp()
      .addField(`**Tier**`, toTitleCase(this.profile.type || '*None*'))
      .addField(`**Themes**`, this.profile.themes ? this.profile.themes.join('\n') : '*None*')

    if (this.profile.type === SantaType.PHYSICAL && this.profile.address) {
      embed.addFields([
        { name: 'Country', value: countryLookup[`${this.profile.address.country}` as 'AD'] || '*None*', inline: true },
        { name: 'State', value: this.profile.address.state || '*None*', inline: true },
        { name: 'Province', value: this.profile.address.province || '*None*', inline: true },
        { name: 'Postal Code', value: this.profile.address.postcode || '*None*', inline: true },
        { name: 'City', value: this.profile.address.city || '*None*', inline: true },
        { name: 'Street', value: this.profile.address.street || '*Unnamed Road*', inline: true },
        { name: 'House Number', value: this.profile.address.houseNumber || '*None*', inline: true }
      ])
    }

    return embed
  }

  save = async () => {
    console.log('Saving profile..')
    console.log('santaprofile:\n', this)
    const guildConfig = SecretSantaMap.get(this.profile.guildId)
    guildConfig?.addProfile(this)
    await saveToDb({
      TableName: 'LeegionBot_Santa_Profiles',
      Item: {
        ...this.profile,
        createdDate: Date.now()
      }
    })
  }

  load = async () => {
    const { Item } = await getFromDb<ISingleResponse<IProfile>>({
      TableName: 'LeegionBot_Santa_Profiles',
      Key: {
        userId: this.profile.userId,
        guildId: this.profile.guildId
      }
    })

    this.profile = { ...Item }

    return this
  }

}

export interface IAddress {
  street: string
  houseNumber: string
  postcode: string
  city: string
  province?: string
  state?: string
  country: string
}

export enum SantaType {
  FREE = 'free',
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
}

export enum SantaStatus {
  PENDING = 'pending',
  COMPLETE = 'complete',
}

interface IDbParams {
  TableName: string
  Item?: {
    [key: string]: any
  }
  Key?: {
    [key: string]: string
  }
}

const saveToDb = async (params: IDbParams) => {
  dynamoDbLib.call('put', params)
}

const getFromDb = async <T>(params: IDbParams): Promise<T> => {
  return dynamoDbLib.call('get', params)
}

const loadFromDb = async <T>(params: IDbParams): Promise<T> => {
  return dynamoDbLib.call('scan', params)
}