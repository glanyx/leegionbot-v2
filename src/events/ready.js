module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Guilds: ${client.guilds.size} - Channels: ${client.channels.size} - Members: ${client.users.size}`);

    await client.set
    await client.generateInvite().then(url => {
        console.log(`Invite me at: ${url}`);
    });

    console.log(`Now listening for events..`);
}