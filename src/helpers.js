const http = require('http');

const transformUserDataToAPI = ({ user, text = 'null', searching = false }) => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    date: +new Date(),
    searching,
    text
});

const sequenceAsyncExecution = async (promisedArray, res, rej, idx = 0) => {
    if (!promisedArray[idx]) return;

    await promisedArray[idx]().then(res).catch(rej);

    await sequenceAsyncExecution(promisedArray, res, rej, ++idx);
};

const withBody = (request) => {
    const body = [];

    return new Promise((res, rej) => {
        request.on('data', chunk => { body.push(chunk); });

        request.on('end', () => {
            try {
                res(JSON.parse(body));
            } catch (e) {
                rej(e);
            }
        });
    })
};

const getResponseMessage = (statusCode, { response, error = null, body }) => {
    response.stausCode = statusCode;

    return JSON.stringify({
        statusCode: statusCode,
        statusMsg: http.STATUS_CODES[statusCode],
        error,
        body
    });
};

module.exports = {
    withBody,
    getResponseMessage,
    transformUserDataToAPI,
    sequenceAsyncExecution
};
