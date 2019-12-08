const fetch = require("node-fetch");
const TelegramBot = require('node-telegram-bot-api');

const db = require('./db');
const helpers = require('./helpers');

require('dotenv').config();

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
    const promisedOffers = [...offers];

    promisedOffers.map(async offer =>  {
        const response = await fetch(process.env.API_GETAWAY+'/details', { method: 'POST', body: JSON.stringify(offer) });
        const offerDetails = await response.json();

        await tBot.sendMediaGroup(transformedUserData.id, offerDetails.images);
        await tBot.sendMessage(transformedUserData.id, offerDetails.title, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        console.log('==>', new Date().getSeconds());
    });

    promisedOffers.map(async (promisedOffer) => {
        await setTimeout(async () => {
            await promisedOffer;
        }, 2000);
        console.log('==>MAP ', new Date().getSeconds());
    });
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
