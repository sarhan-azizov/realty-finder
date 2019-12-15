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

module.exports = {
    transformUserDataToAPI,
    sequenceAsyncExecution
};
