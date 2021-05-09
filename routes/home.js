const express = require("express");
const imports = require("../functions");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        (async () => {
            const token = await imports.existsToken(req);

            if (token) {
                return res.render('home');
            } else {
                res.redirect('/');
            }
        })();
    });

module.exports = router;
