const session = require("express-session");
const express = require("express");
const imports = require("../functions");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        (async () => {
            const oAuth2Client = await imports.authorize();
            const token = await imports.existsToken(req);

            if (token) {
                oAuth2Client.setCredentials(token);
                return res.redirect('/home');
            } else {
                getAccessToken(oAuth2Client);
            }

            function getAccessToken(oAuth2Client) {
                const code = req.query.code;
                console.log("The code is: ", code);
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return res.send("It's not working.");
                    oAuth2Client.setCredentials(token);
                    // Store the token in a web session
                    req.session.token = token;
                    res.redirect("/home");
                });
            }

        })()
            .catch(function(error) {
                console.log(error);
            });
    });

module.exports = router;
