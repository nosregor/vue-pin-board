// https://developers.pinterest.com/docs/api/overview/

require('dotenv').config();

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const localhost = process.env.LOCAL;
let REDIRECT_URI = process.env.REDIRECT_URI || `${localhost}/callback`;
let FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:8080';
const PORT = process.env.PORT || 8888;

if (process.env.NODE_ENV !== 'production') {
  REDIRECT_URI = `${localhost}/callback`;
  FRONTEND_URI = 'http://localhost:3000';
}

const morgan = require('morgan'); 
const path = require('path');
const fs = require('fs');
const express = require('express');
const https = require('https');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const queryString = require('query-string');
const request = require('request');
const history = require('connect-history-api-fallback');

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/dist')));
app.use(cors());
app.use(cookieParser());
app.use(history({
  verbose: true,
  rewrites: [
    { from: /\/login/, to: '/login'},
    { from: /\/callback/, to: '/callback'}
  ],
}));
app.use(express.static(path.resolve(__dirname, '../client/dist')));
app.use(morgan("dev"));

if (process.env.NODE_ENV !== 'production') {
  const certOptions = {
    key: fs.readFileSync(path.resolve('server/ssl/server.key')),
    cert: fs.readFileSync(path.resolve('server/ssl/server.crt'))
  }

  https.createServer(certOptions, app).listen(PORT, function() {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Server up and running...🏃🏃🏻🏃‍');
      console.log(`Listening on https://localhost:${PORT}/ \n`);
    }
  });
} else {
  app.listen(PORT, function() {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Server up and running...🏃🏃🏻🏃‍');
      console.log(`Listening on https://localhost:${PORT}/ \n`);
    }
  });
}

app.get('healthz', function (req,res) {
  res.status(204).send(undefined)
})


app.get('/', function (req, res) {
  res.render((path.resolve(__dirname, '../client/dist/index.html')));
});

const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'pinterest_auth_state';

// Get authorization code
app.get('/login', function(req, res) {
  console.log("LOGIN")
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const parameters = queryString.stringify({
    response_type: 'code',
    client_id: APP_ID,
    state,
    scope: 'user_accounts:read,boards:read,pins:read',
    redirect_uri: REDIRECT_URI,
  });

  // res.redirect(`https://api.pinterest.com/oauth/?${parameters}`);
  res.redirect(`https://www.pinterest.com/oauth/?${parameters}`);
});

// Generate OAuth access token
app.get('/callback', function(req, res) {


  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log({code})
  console.log({state})
  // console.log({cookies})

  if (state === null || state !== storedState) {
    res.redirect(`/#${queryString.stringify({ error: 'state_mismatch' })}`);
  } else {
    res.clearCookie(stateKey);

    const auth = `${process.env.APP_ID}:${process.env.APP_SECRET}`;
    const b64auth = Buffer.from(auth).toString('base64');


    const authOptions = {
      url: 'https://api.pinterest.com/v5/oauth/token',
      form: {
        code: code,
        grant_type: 'authorization_code',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        redirect_uri: REDIRECT_URI,
      },
      headers: {
        Authorization: `Basic ${b64auth}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      json: true,
    };

    console.log(authOptions)

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        res.redirect(`${FRONTEND_URI}/#${queryString.stringify({ access_token })}`);
      } else {
        console.log({response})
        res.redirect(`/#${queryString.stringify({ error: 'invalid_token' })}`);
      }
    });
  }
});