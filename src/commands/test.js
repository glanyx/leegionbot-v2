import * as dynamoDbLib from '../libs/dynamodb-lib';

exports.run = async (client, message, args) => {

    const params = {
        TableName: "santaprofile",
    };

    try{
        const profile = await dynamoDbLib.call("scan", params);
        if (profile.Items){
            profile.Items.forEach(item => {
                console.log(item);
            })
        } else {
            console.log('no items');
        }
        
    } catch (e) {
        console.log(e);
    }

}