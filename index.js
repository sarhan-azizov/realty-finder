process.env.TZ = "Europe/Kiev";

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN || '805923378:AAFQREfGoswE47YyOPJwx9gNTSQzo8HM2zE';
const tBot = new TelegramBot(TOKEN, { polling: true });

tBot.onText(/^\/start$/, (msg, match) => {
    tBot.sendMessage(msg.chat.id, `Hello, to start APP, run <code>/find </code> command.`, {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    });
});

tBot.onText(/^\/find (.+)$/, (msg, match) => {
    const message = msg.chat.text === '/start' ? `Hello, to start APP, run the <code>/start </code>  command.` : match[1];
    const user = {
        id: msg.chat.id,
        first_name: msg.chat.first_name,
        last_name: msg.chat.last_name,
        date: new Date(),
        text: message
    };

    console.log('==> user', user);

    tBot.sendMessage(user.id, message, {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    });
});
