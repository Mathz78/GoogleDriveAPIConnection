const express = require("express");
const {google} = require('googleapis');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const port = 8000;

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

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

module.exports = {
    google: require('googleapis'),
    fs: require('fs'),
    authorize: authorize(),
    existsToken: existsToken(),
    TOKEN_PATH: TOKEN_PATH,
    SCOPES: SCOPES
}

// Setting EJS to be the engine and its folder
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : __dirname + '/temp'
}));

app.use("/", require("./routes/root"));
app.use("/home", require("./routes/home"));
app.use("/auth", require("./routes/auth"));
app.use("/callback", require("./routes/callback"));
app.use("/requestFiles", require("./routes/requestFiles"));
app.use("/uploadFiles", require("./routes/uploadFiles"));

app.listen(port, () => {
    console.log(`Listening at: https://localhost:${port}`);
});