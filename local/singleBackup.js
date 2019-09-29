const moment = require('moment');
const mongoexport = require('mongoexport-wrapper');
const mongodb = require('mongodb').MongoClient;
const nodemailer = require('nodemailer');
const prependFile = require('prepend-file');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});
const { MONGODB_URL, RECIPIENT_EMAIL, LOCAL_BACKUP_PATH, DATABASE_NAME } = process.env;

mongodb.connect(MONGODB_URL, (err, client) => {
    const db = client.db(DATABASE_NAME);
    db.listCollections().toArray((err, collections) => {
        const today = moment();
        const promsieArr = collections.map(c => {
            return new Promise((resolve, reject) => {
                mongoexport({ uri: MONGODB_URL, collection: c.name, out: `${LOCAL_BACKUP_PATH}/${today.format('MM-DD-YYYY-HH-mm-ss')}/${c.name}.json` }, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        Promise.all(promsieArr).then(allRes => {
            client.close();
            const successResponse = JSON.stringify(allRes);
            console.log('files uploaded!!!', successResponse);
            prependFile.sync('log.txt', `Local Backup Success At: ${today.format('MM-DD-YYYY HH:mm:ss')} - ${successResponse}\n\n`);
            transporter.sendMail({
                from: 'moviecriticalerts@gmail.com',
                to: RECIPIENT_EMAIL,
                subject: 'Backup Success - Dropbox',
                text: `Backup Success - Dropbox`
            });
        }).catch(err => {
            client.close();
            const errorResponse = JSON.stringify(err);
            console.log('err uploading one or more', errorResponse);
            prependFile.sync('log.txt', `Local Backup Failure At: ${today.format('MM-DD-YYYY HH:mm:ss')} - ${errorResponse}\n\n`);
            transporter.sendMail({
                from: 'moviecriticalerts@gmail.com',
                to: RECIPIENT_EMAIL,
                subject: 'Backup Failure - Localhost',
                text: 'Backup Failure - Localhost'
            });
        });
    });
});