const {google} = require('googleapis');
const fs = require('fs');

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

    console.log("Entrou no authorize()");

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

    console.log("Entrou no existsToken()");
    return await promise;
}

module.exports = {fs, authorize, existsToken, SCOPES, TOKEN_PATH};
