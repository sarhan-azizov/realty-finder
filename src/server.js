const http = require('http');

require('dotenv').config();

const tBot = require('./telegram-bot'); // Initialize subscribe to telegram bot chanel
const helpers = require('./helpers');

const httpHandler = async (request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
        return response.end(JSON.stringify({ status: 'OK' }));
    } else if (request.method === 'POST' && request.url === '/realty-finder') {
        try {
            const body = await helpers.withBody(request);

            tBot.sendMessage(475907058, body.sarhan, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            response.end(helpers.getResponseMessage(200, { response, body }));
        } catch (error) {
            response.end(helpers.getResponseMessage(500, { response, error }));
        }
    }

    response.end(helpers.getResponseMessage(404, { response }));
};

const server = http.createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json');

    httpHandler(request, response);
});

server.listen(process.env.PORT, err => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.PORT}`)
});
