import { getAllServerConfigs } from '../handlers/SecretSanta'

module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Guilds: ${client.guilds.cache.size} - Channels: ${client.channels.cache.size} - Members: ${client.users.cache.size}`);

    await client.set
    await client.generateInvite().then(url => {
        console.log(`Invite me at: ${url}`);
    });

    console.log(`Fetching Secret Santa configurations..`)

    getAllServerConfigs()

    console.log(`Now listening for events..`);
}