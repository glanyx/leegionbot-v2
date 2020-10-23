import { Client, Message } from 'discord.js'

export const run = (client: Client, message: Message, args: string[]) => {

  if (!client.user) return

  message.channel.send({
    embed: {
      title: "** ===ABOUT LEEANDLIE=== **",
      description:
        'Amanda Lee is a voice actress and vocalist, best known to her viewers as AmaLee or "LeeandLie" on YouTube, where she has gained over 1.2 million subscribers and 400+ million views for her English covers of popular anime and video-game songs. In addition to her music, Amanda has also had the pleasure providing her voice to anime titles such as Cardcaptor Sakura: Clear Card as Akiho Shinomoto, Overlord II as Crusch Lulu, Grimoire of Zero as Zero, Hinamatsuri as Anzu, Magical Girl Raising Project as Nemurin, and One Piece as Queen Otohime, among many others. She can also be heard in video-game titles such as Dragon Ball: Xenoverse 2, Crystalline, Yandere Simulator, and The Letter. Amanda has also provided vocals for anime and video-game soundtracks, including an insert song for the Tokyo Ghoul:Re soundtrack, as well as a collaboration with Porter Robinson. In 2017 she released her debut EP: "Hourglass" featuring 5 original songs and currently has 9 cover albums to her name.',
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL
      },
      timestamp: new Date(),
      color: 16622136,
      footer: {
        icon_url: client.user.avatarURL,
        text: client.user.username
      }
    }
  });
};

export const help = {
  name: "about",
  category: "System",
  description: "Displays general information about LeeandLie.",
  usage: "about"
};
