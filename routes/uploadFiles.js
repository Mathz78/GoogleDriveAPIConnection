const express = require("express");
const imports = require("../functions");
const fs = require('fs');
const {google} = require("googleapis");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize();
            const token = await imports.existsToken();

            if (token) {
                oAuth2Client.setCredentials(token);
                res.render('uploadFiles');
            } else {
                res.redirect('/')
            }
        })();
    })
    .post((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize();
            const token = await imports.existsToken();

            if (token) {
                oAuth2Client.setCredentials(token);
                res.render('uploadFiles');
            } else {
                res.redirect('/')
            }

            const file = req.files.file;
            const fileName = file.name;
            const mimeType = file.mimetype;
            const filePath = file.tempFilePath;

            const fileMetadata = {
                "name": fileName
            };
            const media = {
                mimeType: mimeType,
                body: fs.createReadStream(filePath)
            };

            function uploadFile(auth) {
                const drive = google.drive({version: 'v3', auth});
                drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }, function (err, file) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Photo sent successfully");
                        console.log("File ID: " + file.data.id);
                        res.redirect('/home');
                    }
                })
            }

            uploadFile(oAuth2Client);
        })();
    });

module.exports = router;