const express = require("express");
const imports = require("../functions");
const {google} = require("googleapis");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize();
            const token = await imports.existsToken();

            console.log(token);
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

module.exports = router;