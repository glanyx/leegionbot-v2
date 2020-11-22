import { MessageEmbed, User, Message } from 'discord.js'

export const toTitleCase = (text: string) => {
  return text.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

interface ITextInput {
  user: User
  prompt: string | MessageEmbed
  timeout?: number
  limit?: number
}

export const getTextInput = ({
  user,
  prompt,
  timeout,
  limit
}: ITextInput): Promise<string> => {

  const TIMEOUT = timeout || 1800000

  return new Promise<string>((resolve, reject) => {

    user.send(prompt)
      .then(message => {
        const collector = message.channel.createMessageCollector(m =>
          user === m.author,
          {
            max: limit,
            idle: TIMEOUT
          }
        )

        collector.on("collect", (m: Message) => {
          collector.stop()
          resolve(m.content)
        })

        collector.on('end', collected => {
          if (collected.size < 1) {
            user.send('This message timed out.')
            reject(new Error('Message timed out.'))
          }
        })
      
      }).catch(e => {
        console.log(e)
        reject(new Error('Message timed out.'))
      })
  })
}