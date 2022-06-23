const express = require('express');

const sendStatus = (statusCode, res, err) => {
	if (err) console.log(err);
	res.sendStatus(statusCode);
};


