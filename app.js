const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const shell = require('shelljs');
const COMMANDS = require("./commands");
const bodyParser = require('body-parser');
const request = require("request");
const TV_IP_ADDRESS = process.env.TV_IP_ADDRESS || "192.168.1.222";

console.log(TV_IP_ADDRESS);

app.use(bodyParser.json({ type: 'application/json' }))

app.get('*', (req, res) => res.send({status: 200}))

const getAction = (req, res) => {

	const { command = "" } = req.body;

	const action = COMMANDS.find(action => action.name.toLowerCase() === command.toLowerCase());

	if (!action || !action.value) {
		res.send({ error: "Action not found" });
	}

	return action;
}

app.post('/command', (req, res) => {

	const action = getAction(req, res);

	console.log(`./sh/send_command.sh ${TV_IP_ADDRESS} ${action.value}`);

	shell.exec(`./sh/send_command.sh ${TV_IP_ADDRESS} ${action.value}`, (code, stdout, stderr) => res.send(({
		code, stdout, stderr
	})))
});

app.post('/rest-command', (req, res) => {

	const action = getAction(req, res);

	var options = {
		method: 'POST',
	  url: 'http://192.168.1.222/sony/IRCC',
	  headers: {
	  	'Postman-Token': '4d40162a-27fa-23e7-4a27-cc71ba7d4d0f',
	    'Cache-Control': 'no-cache',
	    'Content-Type': 'application/xml'
	  },
	  body: '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>'+action.value+'</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>'
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  res.send(body);
	});

});

app.listen(port, () => {
  console.log('We are live on ' + port);
});