Mongodb Backup GUI is an open source, free mongodb backup application with a simple ui to enter database url and related info to continuously back up your data to localhost and/or dropbox with email alerts.

Supported Platforms: Windows, Mac, Linux, and Chromebook.

Unsupported Platforms: Linux/Windows Live CD/USB/ISO Environments (OS should be fully installed for app to work properly).

Prerequisites to run:

0. Nodejs/npm must be installed.
1. Mongodb must be installed.
2. Dropbox client must be installed to the default location to back up to dropbox in addition to localhost.

A.(Recommended Installation Method) To install and run app from github repo:
Repo link:
https://github.com/tulaneadam/mongodb-backup-gui-open.git

Windows Installation:

1. install nodejs/npm.
2. install mongodb (and add default system path variable, recommend install via chocolatey )
3. npm i && npm start
4. Fill in required mongodb backup info (mongodb url, gmail info, etc.) in browser that was opened on localhost:3000
5. Select "Backup Now" or turn on continuous backup.

Valid Windows local backup path format is:

C:\Users\${username}\Desktop\mongobackupgui

Mac Installation:

1. install nodejs/npm.
2. install mongodb (recommend install via brew)
3. npm i && npm start
4. Fill in required mongodb backup info (mongodb url, gmail info, etc.) in browser that was opened on localhost:3000
5. Select "Backup Now" or turn on continuous backup.

Valid Mac local backup path format is:

/Users/${username}/Desktop/Mongobackupgui

Linux:

1. install nodejs/npm.
2. install mongodb (recommend install via software center)
1. sudo apt install mongo-tools
2. npm i && npm start
3. Fill in required mongodb backup info (mongodb url, gmail info, etc.) in browser that was opened on localhost:3000
4. Select "Backup Now" or turn on continuous backup.

Valid Linux local backup path format is:

/home/${username}/Desktop/mongobackupgui

Chromebook Installation:

1. install nodejs/npm.
2. install mongodb 
3. sudo apt install mongo-tools
4. npm i && npm start
5. Fill in required mongodb backup info (mongodb url, gmail info, etc.) in browser that was opened on localhost:3000
6. Select "Backup Now" or turn on continuous backup.

Valid Chromebook local backup path format is:

/home/${username}/mongobackupgui

B. (Backup/Alternative Installation Method)  To install and run as npm package.

1.  Create new desktop folder on windows/mac/linux computer.
2.  git bash to new project folder, run npm init on the project folder with default settings.
3.  in project folder, then run:
npm i mongodb-backup-gui
4.  git bash to projectfolder/node_modules/mongodb-backup-gui, then run:
npm i && npm start
5.  Fill in required mongodb backup info (mongodb url, gmail info, etc.) in browser that was opened on localhost:3000
6.  Select "Backup Now" or turn on continuous backup.

<a href="https://imgur.com/AZ6Ja1a"><img src="https://i.imgur.com/AZ6Ja1a.png" title="source: imgur.com" /></a>
