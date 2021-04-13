const express = require("express");
const imports = require("../app");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize;
            const token = await imports.existsToken;

            if (token) {
                oAuth2Client.setCredentials(token);
                return res.redirect('/home');
            } else {
                getAccessToken(oAuth2Client);
            }

            function getAccessToken(oAuth2Client) {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: imports.SCOPES,
                });

                console.log("");
                console.log("Redirecting to Google...");
                res.redirect(authUrl);
            }
        })();
    })

module.exports = router;
