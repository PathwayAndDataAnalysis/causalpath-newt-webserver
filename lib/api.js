const fs = require('fs')
const express = require('express');
let router = express.Router();

const sendStatus = (statusCode, res, err) => {
    if (err) console.log(err);
    res.sendStatus(statusCode);
};

router.post('/getJsonAtPath', function (req, res) {
    let dir = req.body;

    console.log('dirrector')
    console.log(dir)

    let sendStatus500 = (err) => sendStatus(500, res, err);
    let sendStatus400 = (err) => sendStatus(400, res, err);

    try {
        // res.status(200).send("here is your file")
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
        console.log(error);
        sendStatus500(error);
    }
})


const readJsonFile = function (filePath) {
    return fs.readFileSync(filePath, 'utf-8');
};

module.exports = router;