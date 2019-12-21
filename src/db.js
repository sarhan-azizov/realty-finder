const AWS = require("aws-sdk");

class DataBase {
    add({ TableName, Item }) {
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: 'us-east-1',
        });

        const docClient = new AWS.DynamoDB.DocumentClient();

        docClient.put({
            TableName,
            Item,
        }).promise().then(data => {
            console.log("Succeeded added item", data);

            return data;
        }).catch(err => {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));

            return Promise.reject(err);
        })
    };

    get({ TableName, Key }) {
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: 'us-east-1',
        });

        const docClient = new AWS.DynamoDB.DocumentClient();

        return docClient.get({
            TableName,
            Key,
        }).promise().then(data => {
            console.log("Succeeded read item", data);

            return data;
        }).catch(err => {
            console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));

            return Promise.reject(err);
        })
    };

    update({ TableName, Key, UpdateExpression, ExpressionAttributeValues }) {
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: 'us-east-1',
        });

        const docClient = new AWS.DynamoDB.DocumentClient();

        return docClient.update({
            TableName,
            Key,
            UpdateExpression,
            ExpressionAttributeValues,
            ReturnValues:"UPDATED_NEW"
        }).promise().then(data => {
            console.log("Succeeded update item", data);

            return data;
        }).catch(err => {
            console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));

            return Promise.reject(err);
        })
    };
}

module.exports = new DataBase();
