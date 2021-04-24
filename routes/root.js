const express = require("express");
const imports = require("../functions");
const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        if (imports.fs.existsSync('token.json')) {
            return res.redirect('/home');
        } else {
            return res.render('index');
        }
    });

module.exports = router;
