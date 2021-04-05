const express = require("express");
const readline = require('readline');
const {google} = require('googleapis');
var request = require('request');
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
    res.render('index', {
        foo: 'FOO'
    });
});

app.get('/auth', (req, res) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content));
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client);
            if (token) {
                oAuth2Client.setCredentials(JSON.parse(token));
                res.send('successful');
            }
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log("");
        console.log("Redirecting to Google...");
        res.redirect(authUrl);


        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // console.log(url.parse(req.url).pathname);

        // Getting the Google's CODE from the URL
        // var googleUrl = window.location.search;
        // var urlParams = new URLSearchParams(googleUrl);
        // var googleCode = urlParams.get('code');
        //
        // console.log(googleCode);

        // Using URL
        // function getFormattedUrl(req) {
        //     return url.format({
        //         protocol: req.protocol,
        //         host: req.get('host'),
        //         pathname: req.originalUrl
        //     });
        // }
        //


        var interval = setInterval(function(){
            // var url = getFormattedUrl(req);
            // console.log(url);

            // var r = request(authUrl, function (e, response) {
            //     // console.log(r.uri);
            //     console.log(response.request.uri);
            // })

            console.log(res);
        }, 5000);

        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            console.log(req.get());
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
});

app.get('/requestFiles', (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), listFiles);
    });

    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    /**
     * Lists the names and IDs of up to 10 files.
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
            var test = res.data;

            console.log("Qnt of Files: ", files.length);
            console.log("Qnt of data: ", test.length);
            returnView(files);
        });
    }

    function returnView(files) {
        res.render('result', {files: files});
    }
});

app.listen(port, () => {
    console.log(`Listening at: https://localhost:${port}`);
});