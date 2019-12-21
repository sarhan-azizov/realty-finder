const fetch = require("node-fetch");
const TelegramBot = require('node-telegram-bot-api');

const db = require('./db');
const helpers = require('./helpers');

const tBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

tBot.onText(/^\/start$/, async (msg, match) => {
    await tBot.sendMessage(msg.chat.id, `Hello, to start APP, run <code>/find </code> command.`, {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    });

    const transformedUserData = helpers.transformUserDataToAPI({ user: msg.chat });
    const user = await db.get({
        TableName: "realty-finder-users",
        Key: { "id": transformedUserData.id }
    });
    const isUserExist = Boolean(user.Item);

    if (!isUserExist) {
        await db.add({
            TableName: "realty-finder-users",
            Item: transformedUserData
        });
    }
});

tBot.onText(/^\/find$/, async (msg, match) => {
    const text = msg.chat.text === '/start' ? `Hello, to start APP, run the <code>/start </code>  command.` : match[1];
    const transformedUserData = helpers.transformUserDataToAPI({ user: msg.chat, text, searching: true });

    await db.update({
        TableName: "realty-finder-users",
        Key: {
            id: transformedUserData.id,
        },
        UpdateExpression: "set searching = :searching",
        ExpressionAttributeValues:{
            ":searching": transformedUserData.searching,
        }
    });

    const response = await fetch(process.env.API_GETAWAY, { method: 'POST'});
    const offers = await response.json();
    const promisedOffers = offers.reduce((accum, offer) => (
        [...accum, () => fetch(process.env.API_GETAWAY+'/details', { method: 'POST', body: JSON.stringify(offer) })]
    ), []);

    await helpers.sequenceAsyncExecution(promisedOffers, async (response) => {
        const offerDetails = await response.json();

        await tBot.sendMediaGroup(transformedUserData.id, offerDetails.images);

        if (offerDetails.images.length > 1) {
            await tBot.sendMessage(transformedUserData.id, offerDetails.title, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
        }

        console.log('==>', new Date().getSeconds());
    }, (err) => console.log('==>', err));
});

tBot.onText(/^\/stop$/, async (msg, match) => {
    const text = msg.chat.text === '/start' ? `Hello, to start APP, run the <code>/start </code>  command.` : match[1];
    const transformedUserData = helpers.transformUserDataToAPI({ user: msg.chat, text, searching: false });

    await db.update({
        TableName: "realty-finder-users",
        Key: {
            id: transformedUserData.id,
        },
        UpdateExpression: "set searching = :searching",
        ExpressionAttributeValues:{
            ":searching": transformedUserData.searching,
        }
    });

    await tBot.sendMessage(transformedUserData.id, "STOPPED", {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    });
});

module.exports = tBot;
