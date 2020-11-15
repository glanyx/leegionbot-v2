import { Client, Message } from 'discord.js'
import config from "../config/config"
import { SecretSantaMap, SantaProfile, SantaType } from '../handlers/SecretSanta'
import { regionLookup } from '../libs/address-lib'

const shuffle = <T>(array: any[][]): Promise<T[][]> => {
  console.log('Shuffling..')
  return new Promise((resolve, reject) => {
    if (array.length > 1) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i][1], array[j][1]] = [array[j][1], array[i][1]];
      }
      resolve(array);
    } else {
      reject(new Error(`Array too small.`));
    }
  });
}

function validateArrayUnique(array: Object[][]): Promise<boolean> {
  console.log('Validating..')
  return new Promise((resolve, reject) => {
    if (array.length > 1) {
      for (let i = 0; i < array.length; i++) {
        if (array[i][0] === array[i][1]) {
          resolve(false);
        }
      }
      resolve(true);
    } else {
      reject(new Error(`Array too small.`));
    }
  });
}

export const run = async (client: Client, message: Message, args: string[]) => {

  const { channel } = message

  const owner = await client.fetchApplication().then(application => {
    return application.owner
  });

  if (!message.guild || !message.member) {
    channel.send('Please use this command in the Discord server you want to use it for.')
    return
  }

  if (!message.member.hasPermission("ADMINISTRATOR") || owner !== message.author) {
    message.channel.send(`You're not allowed to perform this action!`)
    return
  }
  
  // const serverProfile = SecretSantaMap.get(message.guild.id)
  const serverProfile = SecretSantaMap.get('479861142215327754')

  if (!serverProfile) {
    channel.send(`This server doesn't have the Secret Santa event enabled!`)
    return
  }

  message.delete()

  for (let type in SantaType) {
    
    if (type.toLowerCase() === SantaType.PHYSICAL) {
      
      for (let region in regionLookup) {
        const list: SantaProfile[][] = []

        serverProfile.profiles.forEach(profile => {
          console.log(profile)
          if (!profile.profile.address) {
            channel.send(`Registered User <@${profile.profile.userId}> does not seem to have an address on the Physical Tier. Distribution of Secret Santas terminated.`)
            return
          }

          if (profile.profile.type === type.toLowerCase() && regionLookup[region].countries.includes(profile.profile.address.country)) {
            list.push([profile, profile])
          }
        })

        if (list.length > 0) {
          let shuffled = false
          while (!shuffled) {
            try {
              await shuffle<SantaProfile>(list)
              shuffled = await validateArrayUnique(list)
            } catch (e) {
              console.log(e)
              channel.send(`\`${e.message}\` in \`${type}\` tier (Region: ${regionLookup[region].region}).`)
              return
            }
          }

          list.forEach(item => {
            item[0].setTarget(item[1].profile.userId).save()
          })
        }
      }

    } else {

      const list: SantaProfile[][] = []

      serverProfile.profiles.forEach(profile => {
        if (profile.profile.type === type) {
          list.push([profile, profile])
        }
      })

      if (list.length > 0) {
        let shuffled = false
        while (!shuffled) {
          try {
            await shuffle<SantaProfile>(list)
            shuffled = await validateArrayUnique(list)
          } catch (e) {
            console.log(e)
            channel.send(`\`${e.message}\` in \`${type}\` tier.`)
            return
          }
        }

        list.forEach(item => {
          item[0].setTarget(item[1].profile.userId).save()
        })
      }
  
    }
  }

  const profilesArray = Array.from(serverProfile.profiles, ([name, profile]) => ({ name, profile }))
  channel.send(`Distributing targets to all Secret Santas.. This might take a little while so sit tight! I'll let you know if any errors pop up.`)

  const interval = setInterval(() => {
    const subProfile = profilesArray.splice(0, 2)

    subProfile.forEach(async ({ profile }) => {

      const targetProfile = profile.profile.targetId && serverProfile.profiles.get(profile.profile.targetId)

      if (targetProfile) {
        const user = await client.users.fetch(profile.profile.userId)
        const target = await client.users.fetch(targetProfile.profile.userId)
        
        try {
          user.send(`Hey ${user.username}! This is your target!`)
          user.send(targetProfile.createProfileEmbed(target))
        } catch (e) {
          console.log(e)
          channel.send(`I wasn't able to DM <@${profile.profile.userId}>! Please tell them to allow messages from other server members and have them type ${config.prefix}santatarget in the server!`)
        }
      }
    })

    if (profilesArray.length === 0) {
      serverProfile.disable()
      channel.send(`I've sent all Secret Santas their targets!`)
      clearInterval(interval)
    }
  }, 10000)
  
}

export const help = {
  name: "santadistribute",
  category: "Secret Santa",
  description:
    "Distributes all currently registered users based on their participation tiers and region.\nOnly available to Server Admins or the Bot Owner.",
  usage: "santadistribute"
};
