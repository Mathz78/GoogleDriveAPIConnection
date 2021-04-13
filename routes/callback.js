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

            function getAccessToken(oAuth2Client, callback) {
                const code = req.query.code;
                console.log("The code is: ", code);
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return res.send("It's not working.");
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    imports.fs.writeFile(imports.TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) return console.error(err);
                        console.log('Token stored to: ', imports.TOKEN_PATH);
                        return res.redirect('/home');
                    });
                });
            }
        })();
    });

module.exports = router;
