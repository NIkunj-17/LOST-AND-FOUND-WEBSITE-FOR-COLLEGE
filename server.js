
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./server/router/router');
var hbs = require('express-handlebars');
const path = require('path');
const cookieParser = require("cookie-parser");


// Set the view engine to handlebars
app.set('view engine', 'hbs');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'public')))

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'login',
    layoutsDir: path.join(__dirname, 'views')
}));

app.use('/', router);

// Start the server
app.listen(3000, () => {
    console.log(`Server is started on http://localhost:3000`);
});
