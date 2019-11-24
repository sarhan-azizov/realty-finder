module.exports.transformUserDataToAPI = ({ user, text = 'null', searching = false }) => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    date: +new Date(),
    searching,
    text
});
