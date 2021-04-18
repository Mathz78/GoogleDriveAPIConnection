const express = require("express");
const imports = require("../app");
const fs = require('fs');
const {google} = require("googleapis");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        res.render('uploadFiles');
    })
    .post((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize;
            const token = await imports.existsToken;

            if (token) {
                oAuth2Client.setCredentials(token);
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
                        const message = "You couldn't upload your file. Try again later.";
                        res.render('error', {
                            message: message,
                            errorMessage: err
                        });
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