var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();

var secret = process.env.JWT_SECRET;

var mongoose = require('mongoose');
var User = require('./models/user');
mongoose.connect('mongodb://localhost/devDb'); //change to db want to use

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/users', expressJWT({ secret: secret })
    .unless({ path: ['/api/users'], method: 'POST' }));
app.use('/api/groups', expressJWT({ secret: secret }));
//app.use('/api/events', expressJWT({ secret: secret }));

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({ message: 'You need an authorization token to view this information.' });
    }
});


app.use('/api/events', require('./controllers/events'));
app.use('/api/groups', require('./controllers/groups'));
app.use('/api/users', require('./controllers/users'));


app.post('/api/auth', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err || !user) return res.status(401).send({ message: 'User not found' });
        user.authenticated(req.body.password, function(err, result) {
            if (err || !result) return res.status(401).send({ message: 'User not authenticated' });

            var token = jwt.sign(JSON.stringify(user), secret);
            res.send(token);
        });
    });
});

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(process.env.PORT || 3000);
