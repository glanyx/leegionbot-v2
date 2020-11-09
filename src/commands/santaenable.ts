import { Client, Message } from 'discord.js'
import { SantaServerProfile } from '../handlers/SecretSanta'

exports.run = async (client: Client, message: Message, args: string[]) => {
  const owner = await client.fetchApplication().then(application => {
    return application.owner;
  });

  if (!message.guild) {
    message.channel.send('Please use this command in the Discord server you wish to enable the Secret Santa event for.')
    return
  }

  if (message.member && !message.member.hasPermission("ADMINISTRATOR")) {
    if (owner !== message.author) {
      message.channel.send(`You're not allowed to perform this action!`);
      return;
    }
  }

  const santaProfile = new SantaServerProfile(message.guild.id)
  santaProfile.save()
    .then(() => {
      message.channel.send('Secret Santa has been enabled for this server. Have fun!')
    })
    .catch(error => {
      console.log(error)
      message.channel.send('Looks like something went wrong setting up the event. Please try again or reach out to my owner.')
    })

};

exports.help = {
  name: "santaenable",
  category: "Secret Santa",
  description:
    "Enables Secret Santa on the current Guild. Members can use `santaregister` to register for the event.\nOnly available to Server Admins or the Bot Owner.",
  usage: "santaenable"
};
