const express = require("express");
const fileUpload = require('express-fileupload');
const app = express();
const port = 8000;

// Setting EJS to be the engine and its folder
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : __dirname + '/temp'
}));

app.use("/", require("./routes/root"));
app.use("/home", require("./routes/home"));
app.use("/auth", require("./routes/auth"));
app.use("/callback", require("./routes/callback"));
app.use("/requestFiles", require("./routes/requestFiles"));
app.use("/uploadFiles", require("./routes/uploadFiles"));

app.listen(port, () => {
    console.log(`Listening at: https://localhost:${port}`);
});