require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
const qs = require('querystring');
const randomString = require('randomstring');

const port = 80;
const redirect_uri = "https://demo-oauth.thekrishna.in" + '/redirect';

app.use(express.static('views'));
app.use(
    session({
        secret: randomString.generate(),
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: false
    })
);

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res, next) => {
    req.session.csrf_string = randomString.generate();
    const githubAuthUrl =
        'https://github.com/login/oauth/authorize?' +
        qs.stringify({
            client_id: process.env.CLIENT_ID,
            redirect_uri: redirect_uri,
            state: req.session.csrf_string,
            scope: 'user:email'
        });
    res.redirect(githubAuthUrl);
});

app.all('/redirect', (req, res) => {
    const code = req.query.code;
    const returnedState = req.query.state;
    if (req.session.csrf_string === returnedState) {
        axios.post('https://github.com/login/oauth/access_token?' +
                qs.stringify({
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    code: code,
                    redirect_uri: redirect_uri,
                    state: req.session.csrf_string
                }), {})
            .then(response => {
                req.session.access_token = qs.parse(response.data).access_token;
                res.redirect('/user');
            });
    } else {
        res.redirect('/');
    }
});

app.get('/user', (req, res) => {
    axios.get('https://api.github.com/user/public_emails', {
        headers: {
            Authorization: 'token ' + req.session.access_token,
            'User-Agent': 'Login-App'
        }
    }).then(
        response => {
            res.send(
                "<h2>You're logged in!</h2><b>Here's all your emails on GitHub:</b><br><br>" +
                JSON.stringify(response.data) +
                '<p>Go back to <a href="./">log in page</a>.</p>'
            );
        }
    );
});

app.listen(port, () => {
    console.log('Server listening at port ' + port);
});