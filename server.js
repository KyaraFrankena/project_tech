const express = require ('express');
const app = express();
const path = require("path");
const { engine } = require('express-handlebars');
const port = 1337; 


app.use('/static', express.static('static'));

app.engine('.hbs', engine({extname: '.hbs'}));
app.set("view engine", '.hbs');
app.set("views", "./views");


app.get('/', (req, res) => {
    res.render("index.hbs");
})

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})


// var hbs = require('hbs');
// hbs.registerPartials(__dirname + '/views/partials', function (err) {});
// app.get('/', onHome).listen(1337, console.log(('Running on port 1337')));