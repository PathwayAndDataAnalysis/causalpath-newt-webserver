const libxmljs = require('libxmljs');
const fs = require('fs');
const request = require('request');
const querystring = require('querystring');
const nodeMailer = require('nodemailer');

/*
	functions in this file all have to take the same arguments:
	 - req: the ajax request object, contains parameters sent threw ajax call in req.query 
	 - res: the response object that MUST be called through res.send to send the result back
	The only cases where res.send doesn't need to be used is in case of errors.
	Then it is possible to throw the error and let it be handled by the server.js call.
*/
exports.validateSBGNML = function (req, res) {
	let sbgnml;
	// passing the entire map for validation is too big to use GET request. POST should be prefered.
	if (req.method === 'POST') {
		let body = '';
		req.on('data', function (data) {
			body += data;
			// Security: too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (body.length > 1e8) {
				// kill if more than 100MB
				req.connection.destroy();
				res.status(413);
				res.send('Error: Too much data passed');
			}
		});

		req.on('end', function () {
			const post = querystring.parse(body);
			sbgnml = post.sbgnml;
			executeValidate(sbgnml, res);
		});
	} else if (req.method === 'GET') {
		sbgnml = req.query.sbgnml;
		executeValidate(sbgnml, res);
	}

	function executeValidate(sbgnml, res) {
		let xsdString;
		try {
			xsdString = fs.readFileSync('./newt-resources/libsbgn-0.3.xsd', {
				encoding: 'utf8',
			}); // function (err, data) {
		} catch (err) {
			res.status(500);
			res.send('Error: Failed to read xsd file ' + err);
			return;
		}

		let xsdDoc;
		try {
			xsdDoc = libxmljs.parseXml(xsdString);
		} catch (err) {
			res.status(500);
			res.send('Error: libxmljs failed to parse xsd ' + err);
			return;
		}

		let xmlDoc;
		try {
			xmlDoc = libxmljs.parseXml(sbgnml);
		} catch (err) {
			res.status(415);
			res.send('Error: libxmljs failed to parse xml ' + err);
			return;
		}

		if (!xmlDoc.validate(xsdDoc)) {
			var errors = xmlDoc.validationErrors;
			var errorList = [];
			for (var i = 0; i < errors.length; i++) {
				// I can't understand the structure of this object. It's a mix of object with string in the middle....
				var error = errors[i];
				var message = error.toString(); // get the string message part
				var newErrorObj = {}; // get the object properties
				newErrorObj.message = message;
				for (var key in error) {
					newErrorObj[key] = error[key];
				}
				errorList.push(newErrorObj);
			}
			res.send(errorList);
		} else {
			res.send([]);
		}
	}
};

/**
 * Simple get request to other page. Used to test the validity of annotations links.
 * Simply pass the response back.
 * This cannot be done on browser side due to CORS/same-origin policies forbiding requests
 * by the application to other domains than the application's domain.
 */
exports.testURL = function (req, res) {
	const options = {
		url: req.query.url,
		method: 'GET',
		qs: req.query.qs,
		timeout: 30000,
	};

	request.get(options, function (error, response, body) {
		res.send({ error: error, response: response });
	});
};

exports.sendEmail = function (req, res) {
	const fileContent = req.body.fileContent;
	let transporter = nodeMailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			// should be replaced with real sender's account
			user: 'newtforminerva@gmail.com',
			pass: process.env.newtforminerva_pwd,
		},
	});
	const attachment = fileContent !== 'no-data';
	let mailOptions = {
		// should be replaced with real recipient's account
		//to: 'replyto.lcsb.gitlab+minerva-core-499-3hxqgkf3oh3yq2zb9veolqjo6-issue@gmail.com',
		to: 'newteditor@gmail.com',
		cc: 'newteditor@gmail.com',
		subject: 'Error Report From Newt',
		text: req.body.message,
		attachments: !attachment
			? []
			: [
				{
					filename: 'input.txt',
					content: fileContent,
				},
			],
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
	});
	res.send('OK');
};

exports.ServerRequest = function (req, res) {
	let options;
	//request for taking authentication from minerva api
	if (req.body.postType === 'auth') {
		options = {
			url: req.body.address,
			method: 'POST',
			timeout: 30000,
			json: req.body.param,
			contentType: 'application/json',
		};

		request.post(options, function (error, response, body) {
			res.send({ error: error, response: response });
		});
	} else {
		//request for sending the file to be changed
		const headers = {
			Cookie: req.body.token,
			'Content-Type': 'text/plain',
		};
		options = {
			url: req.body.url,
			method: 'POST',
			qs: req.query.qs,
			timeout: 30000,
			body: req.body.file,
			headers: headers,
		};

		request.post(options, function (error, response, body) {
			res.send({ error: error, response: response.body });
		});
	}
};
