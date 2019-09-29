const moment = require('moment');
const mongoexport = require('mongoexport-wrapper');
const mongodb = require('mongodb').MongoClient;
const nodemailer = require('nodemailer');
const prependFile = require('prepend-file');
const cron = require('node-cron');

const CRON_MAP = {
    6: '0 0 0,6,12,18,24 * * *',
    24: '0 0 1 * * *',
    168: '0 0 1 * * 1'
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});
const HOME_DIR = require('os').homedir();
const { MONGODB_URL, RECIPIENT_EMAIL, DATABASE_NAME } = process.env;

/* cron is set for 12 hour backups at 8am and 6pm daily with "0 0 7,17 * * *"     */
module.exports = interval => cron.schedule(CRON_MAP[interval], () => {
    mongodb.connect(MONGODB_URL, (err, client) => {
        const db = client.db(DATABASE_NAME);
        db.listCollections().toArray((err, collections) => {
            const today = moment();
            const promsieArr = collections.map(c => {
                return new Promise((resolve, reject) => {
                    mongoexport({ uri: MONGODB_URL, collection: c.name, out: `${HOME_DIR}/Dropbox/MongodbBackupGui/${today.format('MM-DD-YYYY-HH-mm-ss')}/${c.name}.json` }, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            Promise.all(promsieArr).then(allRes => {
                /*
                fs.mkdir(path.resolve(`${__dirname}/../../MovieCriticBackups/${today.format('MM-DD-YYYY-HH-mm-ss')}`), () => {
                    const files = fs.readdirSync(path.resolve(`${__dirname}/../../../Dropbox/Apps/MovieCritic/${today.format('MM-DD-YYYY-mm-ss')}`)).filter(f => f.endsWith('.json'));
                    const filesPromise = files.map(file => {
                        fs.copyFileSync(path.resolve(`${__dirname}/../../../Dropbox/Apps/MovieCritic/${today.format('MM-DD-YYYY-mm-ss')}/${file}`), path.resolve(`${__dirname}/../../MovieCriticBackups/${today.format('MM-DD-YYYY-HH-mm-ss')}/${file}`));
                        return 'success';
                    });
                    Promise.all(filesPromise).then(allRes => {
    
                    }).catch(err => {
                        console.log('err saving files to local backup dir', err);
                    });
                });
                */
                console.log('files uploaded!!!', allRes);
                prependFile.sync('log.txt', `Dropbox Backup Success At: ${today.format('MM-DD-YYYY HH:mm:ss')} - ${JSON.stringify(allRes)}\n\n`);
                transporter.sendMail({
                    from: 'moviecriticalerts@gmail.com',
                    to: RECIPIENT_EMAIL,
                    subject: 'Backup Success - Dropbox',
                    text: `Backup Success - Dropbox`
                });
                client.close();
            }).catch(err => {
                console.log('err uploading one or more', err);
                prependFile.sync('log.txt', `Dropbox Backup Failure At: ${today.format('MM-DD-YYYY HH:mm:ss')} - ${err}\n\n`);
                transporter.sendMail({
                    from: 'moviecriticalerts@gmail.com',
                    to: RECIPIENT_EMAIL,
                    subject: 'Backup Failure - Localhost',
                    text: 'Backup Failure - Localhost'
                });
                client.close();
            });
        });
    });
    
}, { timezone: 'America/New_York' });