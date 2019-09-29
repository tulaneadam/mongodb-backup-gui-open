const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3020;

app.use(express.json());
app.use(express.static(__dirname + '/dist'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api/single', (req, res) => {
    const { env, type } = req.body
    exec(`cross-env ${env} node ${type}/singleBackup.js`, (err, stdout, stderr) => {
        /*
        console.log('errrrrrrrrr', err);
        console.log('stdoooooouttt', stdout);
        console.log('stderrrrrrrrrr', stderr);
        */
        res.send({ success: 'backup complete' });
    });
});

app.post('/api/start', (req, res) => {
    const { type, interval, env } = req.body;
    exec(`cross-env ${env} pm2 start ${type}/server.js --name ${type} -- ${interval}`, (err, stdout, stderr) => {
        res.send({ success: 'online' });
    });
});

app.post('/api/stop', (req, res) => {
    const { type } = req.body;
    exec(`pm2 del ${type}`, (err, stdout, stderr) => {
        res.send({ success: 'stopped' });
    });
});

app.get('/api/status', (req, res) => {
    const { os } = req.query
    exec('pm2 jlist', (err, stdout, stderr) => {
        if (err || stderr) {
            res.status(500).send({ err: err || stderr });
        } else {
            const output = {
                localBackupPath: `${require('os').homedir().replace(/\\/g, '/')}/Desktop/MongodbBackupGui`
            }
            if (os === 'Chrome OS') {
                output.localBackupPath = `${require('os').homedir().replace(/\\/g, '/')}/MongodbBackupGui`
            }
            output.data = stdout.startsWith("[{") ? JSON.parse(stdout) : [];
            output.data = output.data.map(p => ({
                [p.name]: p.pm2_env.status === 'online' ? true : false
            }))
            res.send(output);
        }
    });
});

app.get('/api/fstatus', (req, res) => {
    exec('pm2 jlist', (err, stdout, stderr) => {
        if (err || stderr) {
            res.status(500).send({ err: err || stderr });
        } else {
            const output = {
                localBackupPath: `${require('os').homedir().replace(/\\/g, '/')}/Desktop/MongodbBackupGui`
            }
            output.data = stdout.startsWith("[{") ? JSON.parse(stdout) : [];
            output.data = output.data.map(p => ({
                [p.name]: p.pm2_env.status === 'online' ? true : false,
                //[`${p.name}MongoUrl`]: p.pm2_env.MONGODB_URL,
                //[`${p.name}GmailEmail`]: p.pm2_env.GMAIL_EMAIL,
                //[`${p.name}GmailPassword`]: p.pm2_env.GMAIL_PASSWORD,
                //[`${p.name}AccessToken`]: p.pm2_env.DROPBOX_ACCESS_TOKEN,
            }))
            //.map(p => ({ name: p.name, status: p.pm2_env.status }))
            res.send(output);
        }
    });
});

app.listen(PORT, () => console.log('process running on ' + PORT));