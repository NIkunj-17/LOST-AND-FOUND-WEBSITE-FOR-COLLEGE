const express = require('express');
const route = express.Router();
const controller = require('../controller/controller');
const store = require('../middleware/multer');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const cookie = require("cookie");

const authMiddleware = (req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' }); // Redirect or error handling
    }

    try {
        const decoded = jwt.verify(token, "123"); // Validate JWT on server
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' }); // Handle invalid tokens
    }
};

route.get('/', controller.loginPage);
route.post('/login', controller.login);

route.get('/logout', controller.logout);

route.get('/register', controller.RegisterPage);
route.post('/register', controller.register);

route.get('/home',authMiddleware, controller.home);
route.post('/upload', store.array('images', 12), controller.uploads);
route.post('/updateDetails', controller.updateDetails);

route.get('/profile', controller.profile);

route.get('/about', authMiddleware, controller.about);
route.get('/contact', authMiddleware, controller.contact);
route.get('/myProfile', authMiddleware, controller.myProfile);

// route.get('/register', (req, res) => {
//     res.render('register');
// });
// route.get('/login', (req, res) => {
//     res.render('login');
// });
// route.post('/register', controller.register);

// route.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }));

// // Logout route
// route.get('/logout', (req, res) => {
//     req.logout();
//     res.redirect('/login');
// });

module.exports = route;
