exports.run = async (client, message, args) => {
    client.fetchApplication().then(application => {
        message.channel.send(`Sorry, this is still being setup! In the meantime, please message ${application.owner.tag}`);
    });
}