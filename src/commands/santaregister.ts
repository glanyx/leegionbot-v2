import { Client, Message, User, ClientUser, MessageEmbed, MessageReaction } from 'discord.js'
import config from "../config/config"
import { SecretSantaMap, SantaProfile, SantaType, SantaStatus, IAddress } from '../handlers/SecretSanta'
import { getGeoLocation, getStreetData, countryLookup } from '../libs/address-lib'
import { getTextInput } from '../helpers'

const TIMEOUT = 180000

export const run = async (client: Client, message: Message, args: string[]) => {

  const { author: user, channel } = message
  const self = client.user
  const { owner } = await client.fetchApplication()

  if (!(owner instanceof User) || !self) {
    channel.send('Something seems to have gone wrong. Please contact my owner for assistance.')
    return
  }

  if (!message.guild) {
    channel.send('Please use this command in the Discord server you wish to register in the Secret Santa event for.')
    return
  }

  if (!SecretSantaMap.get(message.guild.id)?.enabled || !SecretSantaMap.has(message.guild.id)) {
    channel.send(
      `Registrations have closed! If you already registered and wish to see your profile, type \`${config.prefix}santaprofile\`!`
    )
    return
  }

  let santaProfile: SantaProfile = new SantaProfile({
    userId: user.id,
    guildId: message.guild.id,
    status: SantaStatus.PENDING
  })

  user.send(
    `Hey ${user.username}!\nThanks for registering for the ${message.guild.name} Secret Santa event. Even a little bot like me must go by the rules, so to continue the registration process, you must agree to the below Terms and Conditions. Please read them carefully and respond to the appropriate emoji to Accept or Decline.`
  ).catch(e => {
    console.log(e)
    channel.send(`I can't DM you, ${message.author}! If you have DMs disabled, please temporarily enable them!`)
    return
  })

  try {
    santaProfile
      .setTermsAndConditions(await getTermsAndConditions(user, self, owner))
      .setType(await getType(user))

    if (santaProfile.profile.type === SantaType.PHYSICAL) {
      const addressInputType = await getManualOrAutomated(user)

      if (addressInputType === 'automated') {
        santaProfile
          .setAddress({
            ...await getAddress(user),
            houseNumber: await getHouseNumber(user)
          })
  
      } else if (addressInputType === 'manual') {
        santaProfile
          .setAddress({
            country: await getCountry(user),
            state: await getState(user),
            province: await getProvince(user),
            city: await getCity(user),
            postcode: await getPostcode(user),
            street: await getStreet(user),
            houseNumber: await getHouseNumber(user)
          })
      }
    }

    santaProfile
      .setThemes(await getThemes(user))
      .setStatus(SantaStatus.COMPLETE)
      .save()
  } catch (e) {
    user.send('The Secret Santa event registration will now stop.')
    return
  }

  const endEmbed = new MessageEmbed()
    .setColor(3800852)
    .setTitle('**Success!!**')
    .setDescription(
      `WHOO!! We're all done, ${user.username}! Thank you so much for registering for the ${message.guild.name} Secret Santa event.\n
      There is nothing for you to do right now, so please sit tight. I'll be in touch again when I know who you'll be sending a gift! In the meantime, please spread the Christmas cheer!\n
      If you want to check your profile, please type \`${config.prefix}santaprofile\`!`
    )

  // End registration
  user.send(endEmbed)
  
}

const getTermsAndConditions = (user: User, self: ClientUser, owner: User) => {
  
  const tAndCEmbed = new MessageEmbed()
    .setColor(16622136)
    .setTitle('Terms and Conditions')
    .setDescription(
      `${self.username}, created by ${owner.username}, will hereby be approved to receive publically available data from your Discord Profile and any additional information that you send it. Aforementioned data is stored on an AWS server in London and will only be used for the sole purpose of this Secret Santa event. Your data will only be shared with the bot owner and any Discord user that you are matched with during the event.\n
      **Your data will never be shared with, or sold to any additional third parties.**\n
      Neither ${self.username}, its owner ${owner.username}, nor the moderators, admins or owner of the Discord hosting this Secret Santa event can be held responsible for any missing items / gifts or any potential unfair balance between gifts sent or gifts received.\n
      If you complete this registration process and change your mind before you have been assigned a target, you will be able to drop out from the event without a penalty. By accepting these terms you agree to provide a gift for your assigned target, reasonably within the gift tier you sign up for. Failure to provide a gift by the time / date specified by the organizer of the Secret Santa event in your server will result in a loss of reputation on your profile and you may be excluded from future events in this server or other servers managed through ${self.username}.
      By clicking the Green Tick emoji you agree with the above Terms and Conditions. By clicking the Red Cross emoji or allowing this message to time out (3 minutes) you do not agree with the above Terms and Conditions and the registration process will be terminated.`
    )
  
  return new Promise<boolean>((resolve, reject) => {
    user.send(tAndCEmbed).then(async message => {
      await message.react("507285695484919809")
      await message.react("507287289282428962")
      await message.awaitReactions((reaction, userA) =>
        (reaction.emoji.id === "507285695484919809" || reaction.emoji.id === "507287289282428962") && userA === user,
        {
          max: 1,
          time: TIMEOUT,
          errors: ["time"]
        }
      ).then(async collected => {
        const firstEmoji = collected.first()
        if (firstEmoji && firstEmoji.emoji.id === "507285695484919809") {
          resolve(true)
        } else {
          reject(new Error('Confirmation Declined'))
        }
      }).catch( e => {
        console.log(e)
        user.send('This message timed out.')
        reject(new Error('Message Timed Out'))
      })
    })
  })
}

const getType = async (user: User) => {

  return new Promise<SantaType>((resolve, reject) => {
    user.send(
      `It's great to have you aboard, ${user.username}!\nWith that out of the way, I just need to ask you a few questions to finalize the registration process. This event is separated into 3 different 'tiers'; Free, Digital and Physical. This is so that people with different interests can still exchange gifts with one another. We do have some guidelines around the different tiers, so please make note of the following:`
    );

    const tierEmbed = new MessageEmbed()
      .setColor(16622136)
      .setTitle('Gift Tiers')
      .setDescription(
        `**Free Tier**
        **Price Estimation**:
          FREE
        **Description**:
          The Free tier will include gifts such as digital art or a recording. This tier was primarily made available for those amongst us who would like to participate but are unable to provide a monetary contribution. If you have that artistic gene or if you have no money to spend during the expensive Christmas period, this is the Tier for you.\n
        **Digital Tier**
        **Price Estimation**:
          $10
        **Description**:
          The Digital tier more or less speaks for itself. This can include gift codes for things such as e-books, games or even commissioned work. If finding a physical gift is simply too much work for you or if you are worried about sharing your personal address, you'll want to opt in for Digital.\n
        **Physical Tier**
        **Price Estimation**:
          $20
        **Description**:
          The Physical tier is for those wanting to go above and beyond, participating to the full extent in the spirit of giving. You will be buying an actual, physical gift for a random recipient and mail it to them by post. You will be matched with someone in roughly the same area to keep shipping costs to a minimal. Please note that in order to proceed with the registration for the Physical tier, I WILL need your physical address.\n
          **NOTE:** Due to the ongoing issues with Covid-19 (otherwise known as the Coronavirus), please prioritize health if you do wish to proceed in this Tier. Covid-19 is supposed to be able to survive on certain material objects for roughly seven days. If you receive a physical present from your Secret Santa, please consider leaving the package untouched until 7 days have passed.`
      )

    user.send(tierEmbed)

    user.send(`Please type either \`free\`, \`digital\` or \`physical\`, based on the tier you would like to opt in for.`)
      .then(message => {
        const collector = message.channel.createMessageCollector(m =>
          user === m.author,
          {
            time: TIMEOUT
          }
        )

        collector.on("collect", (m: Message) => {
          if (m.content.trim().toLowerCase().includes("free")) {
            collector.stop()
            resolve(SantaType.FREE)
          } else if (m.content.trim().toLowerCase().includes("digital")) {
            collector.stop()
            resolve(SantaType.DIGITAL)
          } else if (m.content.trim().toLowerCase().includes("physical")) {
            collector.stop()
            resolve(SantaType.PHYSICAL)
          } else {
            collector.resetTimer()
            user.send(`I couldn't recognize that Tier. Please try again.`)
          }
        })
      
      }).catch(e => {
        console.log(e)
        reject(new Error('Message timed out.'))
      })
  })
}

const getAddress = async (user: User) => {

  return new Promise<IAddress>((resolve, reject) => {
    user.send(
      `Nice! Now that I've got you written down for the Physical tier, I need to ask you for your physical address so that you may receive a gift from your Secret Santa, exciting! Please type in your postcode and I'll do my best to figure out where you live. Tip: You can type your country's Alpha-2 code (https://www.iban.com/country-codes) to narrow down the search, for example \`us [postcode]\` for a postcode in the United States!`
    ).then(message => {
      const collector = message.channel.createMessageCollector(
        message => user === message.author,
        {
          time: TIMEOUT
        }
      );

      collector.on("collect", async (message: Message) => {

        const args = message.content.trimLeft().split(/ +/g)
        let countryIso: string | undefined = undefined

        if (Object.keys(countryLookup).find(item => item.toLowerCase() === args[0].toLowerCase())) {
          countryIso = args.shift()
        }

        const geoLocation = await getGeoLocation(args.join(' '), countryIso)
        if (!geoLocation) {
          user.send(`I couldn't seem to find an address for that postcode.. Try adding a space!`)
          return
        }
        
        const streetData = await getStreetData({ latitude: geoLocation.latitude, longitude: geoLocation.longitude })
      
        if (!streetData) {
          user.send(`I couldn't seem to find an address for that postcode.. Try adding a space!`)
          return
        }
        const { street, mapUrl } = streetData
      
        const addressEmbed = new MessageEmbed()
          .setDescription('I found this address. Does it look okay?')
          .addFields([
            { name: 'Country', value: countryLookup[`${geoLocation.country_code}` as 'AD'], inline: true },
            { name: 'State', value: geoLocation.state || '*None*', inline: true },
            { name: 'Province', value: geoLocation.province || '*None*', inline: true },
            { name: 'Postal Code', value: geoLocation.postal_code, inline: true },
            { name: 'City', value: geoLocation.city, inline: true },
            { name: 'Street', value: street || '*Unnamed Road*', inline: true },
          ])
          .setImage(mapUrl)
          .setFooter('Lookup provided by Zipcodebase© and MapQuest©')
          .setTimestamp()
          
        collector.resetTimer()

        user.send(addressEmbed).then(async reactionMessage => {
          await reactionMessage.react("507285695484919809")
          await reactionMessage.react("507287289282428962")
          reactionMessage.awaitReactions((reaction, userA) =>
            (reaction.emoji.id === "507285695484919809" || reaction.emoji.id === "507287289282428962") && userA === user,
            {
              max: 1,
              time: TIMEOUT,
              errors: ["time"]
            }
          ).then(collected => {
            const firstEmoji = collected.first()
            if (firstEmoji && firstEmoji.emoji.id === "507285695484919809") {
              collector.stop()
              resolve({
                street: street,
                houseNumber: '0',
                postcode: geoLocation.postal_code,
                city: geoLocation.city,
                province: geoLocation.province || undefined,
                state: geoLocation.state || undefined,
                country: geoLocation.country_code
              })
            } else {
              reactionMessage.delete()
              user.send('Please try typing your postcode again.')
              return
            }
          })
          .catch(e => {
            console.log(e)
            reject(new Error('Message Timed Out'))
          })
        })
      })
    })
    .catch(e => {
      console.log(e)
      reject(new Error('Message Timed Out'))
    })
  })
}

const getCountry = async (user: User) => {
  return new Promise<string>(async resolve => {
    let country = undefined
    while (!country){
      const output = await getTextInput({
       user,
       prompt: 'What country do you live in? Please type the full name of your country. (It should be part of this list (https://www.worldometers.info/geography/alphabetical-list-of-countries/)',
       timeout: TIMEOUT,
       limit: 1
     })
     country = Object.keys(countryLookup).find(key => countryLookup[key as 'AF'].toLowerCase() === output.toLowerCase())
     if (!country) await user.send(`I couldn't recognize that country. Let's try that again.`)
    }
    resolve(country)
  })
}

const getState = async (user: User) => {
  const state = await getTextInput({
    user,
    prompt: `And what State is this in? If this doesn't apply to you, just type \`none\``,
    timeout: TIMEOUT,
    limit: 1
  })

  return state !== 'none' ? state : undefined
}

const getProvince = async (user: User) => {
  const province = await getTextInput({
    user,
    prompt: `What is the Province this is in? Again, if this doesn't apply to you, just type \`none\``,
    timeout: TIMEOUT,
    limit: 1
  })
  
  return province !== 'none' ? province : undefined
}

const getCity = (user: User) => {
  return getTextInput({
    user,
    prompt: `Great. And what City is this in?`,
    timeout: TIMEOUT,
    limit: 1
  })
}

const getPostcode = (user: User) => {
  return getTextInput({
    user,
    prompt: `Next I'll need your Postcode please.`,
    timeout: TIMEOUT,
    limit: 1
  })
}

const getStreet = (user: User) => {
  return getTextInput({
    user,
    prompt: `Almost there. What Street do you live on?`,
    timeout: TIMEOUT,
    limit: 1
  })
}

const getHouseNumber = (user: User) => {
  return getTextInput({
    user,
    prompt: 'And what is the house number, flat or appartment?',
    timeout: TIMEOUT,
    limit: 1
  })
}

const getThemes = (user: User) => {

  const themes: string[] = [];

  return new Promise<string[]>(async (resolve, reject) => {

    user.send(
      `We're almost there! We don't want to make this really difficult for your Secret Santa and we'd like you to receive a gift you would like. Please share with me a maximum of 3 themes that you would like to receive a gift for. You must add at least 1 theme, but if you can't think of 3, don't worry, you can finish this part of the registration process by typing \`done\`.\n\nPlease send me each theme as a **NEW** message!`
    )
  
    const createEmbed = () => {
      return new MessageEmbed()
      .setColor(16622136)
      .addField('Current Themes', themes.length === 0 ? '*None*' : themes.join('\n'))
    }

    user.send(createEmbed())
      .then(message => {
        const collector = message.channel.createMessageCollector(
          message => user === message.author,
          {
            max: 3,
            time: TIMEOUT
          }
        );

        collector.on("collect", m => {
          if (m.content.toLowerCase() === "done") {
            collector.stop();
          } else {
            themes.push(m.content);
            message.edit(createEmbed())
          }
        });

        collector.on("end", () => {
          resolve(themes);
        });
      })
      .catch(e => {
        reject(new Error("Message Time Out"));
      });
  });
}

const getManualOrAutomated = (user: User) => {

  const embed = new MessageEmbed()
    .setColor(16622136)
    .setTitle('Your Address')
    .setDescription('I can use your postcode to try to determine your address, however it might be somewhat inaccurate. Do you want to use this automated address lookup feature or do you wish to input your address manually? You can always change your address later!\n1️⃣ - Automated\n2️⃣ - Manual')

  return new Promise<string>((resolve, reject) => {
    user.send(embed).then(async message => {
      await message.react('1️⃣')
      await message.react('2️⃣')
      await message.awaitReactions((reaction: MessageReaction, userA: User) =>
        (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') && userA === user,
        {
          max: 1,
          time: TIMEOUT,
          errors: ['time']
        }
      ).then(async collected => {
        const firstEmoji = collected.first()
        if (firstEmoji && firstEmoji.emoji.name === '1️⃣') {
          resolve('automated')
        } else {
          resolve('manual')
        }
      }).catch( e => {
        console.log(e)
        user.send('This message timed out.')
        reject(new Error('Message Timed Out'))
      })
    })
  })
}

export const help = {
  name: "santaregister",
  category: "Secret Santa",
  description: "Starts the registration process for the Secret Santa event.",
  usage: "santaregister"
};
