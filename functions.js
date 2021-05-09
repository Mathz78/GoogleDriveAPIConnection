const {google} = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

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

async function existsToken(req) {
    let promise = new Promise((resolve) => {
        const token = req.session.token;

        // Check if we have previously stored a token.
        if (token !== undefined) {
            resolve(token);
        } else {
            resolve(false);
        }
    });
    return await promise;
}

module.exports = {fs, authorize, existsToken, SCOPES};
