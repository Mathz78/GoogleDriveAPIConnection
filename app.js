const express = require("express");
const readline = require('readline');
const {google} = require('googleapis');
const request = require('request');
const url = require('url');
const fs = require('fs');
const app = express();
const port = 8000;

// Setting EJS to be the engine and its folder
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

// Google token path
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

app.get('/', (req, res) => {
    if (fs.existsSync('token.json')) {
        return res.redirect('/home');
    } else {
        return res.render('index');
    }
});

async function authorize() {
    let promise = new Promise((resolve, reject) => {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            resolve(JSON.parse(content));
        });
    })
    let credentials = await promise;

    const {client_secret, client_id, redirect_uris} = credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function existsToken() {
    let promise = new Promise((resolve, reject) => {
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return resolve(false);
            if (token) return resolve(JSON.parse(token));
        });
    });
    return await promise;
}

app.get('/auth', (req, res) => {
    (async () => {
        const oAuth2Client = await authorize();
        const token = await existsToken();

        if (token) {
            oAuth2Client.setCredentials(token);
            return res.redirect('/home');
        } else {
            getAccessToken(oAuth2Client);
        }

        function getAccessToken(oAuth2Client) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });

            console.log("");
            console.log("Redirecting to Google...");
            res.redirect(authUrl);
        }
    })();
});

app.get('/callback', (req, res) => {
    (async () => {
        const oAuth2Client = await authorize();
        const token = await existsToken();

        if (token) {
            oAuth2Client.setCredentials(token);
            return res.redirect('/home');
        } else {
            getAccessToken(oAuth2Client);
        }

        function getAccessToken(oAuth2Client, callback) {
            var code = req.query.code;
            console.log("The code is: ", code);
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return res.send("It's not working.");
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to: ', TOKEN_PATH);
                    return res.redirect('/home');
                });
            });
        }
    })();
});

app.get('/home', (req, res) => {
    if (fs.existsSync('token.json')) {
        return res.render('home');
    } else {
        res.redirect('/');
    }
});

app.get('/requestFiles', (req, res) => {
    (async () => {
        const oAuth2Client = await authorize();
        const token = await existsToken();

        if (token) {
            oAuth2Client.setCredentials(token);
            listFiles(oAuth2Client);
        } else {
            res.redirect('/')
        }


        /**
         * Lists the names and IDs of up to 1000 files.
         * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
         */
        var files;

        function listFiles(auth) {
            const drive = google.drive({version: 'v3', auth});
            drive.files.list({
                pageSize: 1000,
                fields: 'nextPageToken, files(id, name)',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                files = res.data.files;

                console.log("Qnt of Files: ", files.length);
                returnView(files);
            });
        }

        function returnView(files) {
            res.render('result', {files: files});
        }
    })();
});

app.listen(port, () => {
    console.log(`Listening at: https://localhost:${port}`);
});