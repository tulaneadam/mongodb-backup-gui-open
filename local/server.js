const express = require('express');
const dbBackup = require('./cronBackup');
dbBackup(process.argv[2]);

const app = express();
const PORT = process.env.PORT || 3060;

app.listen(PORT, () => console.log('server started on ' + PORT));