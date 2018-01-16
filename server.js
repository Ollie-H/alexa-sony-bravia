const express = require('express');
const app = express();
const port = 8000;
const shell = require('shelljs');
const COMMANDS = require("./commands");
const bodyParser = require('body-parser');
const TV_IP_ADDRESS = process.env.TV_IP_ADDRESS;


app.use(bodyParser.json({ type: 'application/json' }))

app.post('/command', (req, res) => {

	const { command = "" } = req.body;

	const action = COMMANDS.find(action => action.name.toLowerCase() === command.toLowerCase());

	if (!action || !action.value) {
		res.send({ error: "Action not found" });
	}

	console.log(`./sh/send_command.sh ${TV_IP_ADDRESS} ${action.value}`);
	shell.exec(`./sh/send_command.sh ${TV_IP_ADDRESS} ${action.value}`, (code, stdout, stderr) => res.send(({
		code, stdout, stderr
	})))
});

app.listen(port, () => {
  console.log('We are live on ' + port);
});