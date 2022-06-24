const fs = require('fs')
const express = require('express');
let http = express.Router();

const sendStatus = (statusCode, res, err) => {
    if (err) console.log(err);
    res.sendStatus(statusCode);
};

http.post('/getJsonAtPath', (req, res) => {
    let dir = req.body;
    console.log('dir', dir)

    let sendStatus500 = (err) => sendStatus(500, res, err);
    let sendStatus400 = (err) => sendStatus(400, res, err);

    try {
        if (!fs.existsSync(dir)) {
            console.log('File does not exist ' + dir);
            sendStatus400();
            res.send('File does not exist');
        } else {
            //Return the json file from the analysis directory to the client
            let fileContent = readJsonFile(dir);
            res.status(200);
            res.send(fileContent);
        }
    } catch (error) {
        sendStatus500();
    }
})


const readJsonFile = function (filePath) {
    return fs.readFileSync(filePath, 'utf-8');
};

module.exports = http;