import path from 'path';
import passport from 'passport';
import fetch from 'node-fetch';
import { OAuth2Strategy } from 'passport-oauth';
import { Router } from 'express';
import Users from './persistence.js';

import dirname from 'ususdirname'
const __dirname = dirname(import.meta.url)

const userDB = path.resolve(__dirname, '../data/users.db')
const router = Router()
var users = new Users(userDB)

router.get('/auth/provider', passport.authenticate('provider', {scope: 'profile' }))
router.get('/auth/provider/callback', passport.authenticate('provider', {
  successRedirect: process.env.OAUTH2_SUCCESS_FORWARD,
  failureRedirect: '/fail'
}))
router.get('/auth/info', protect, (req, res) => {
    res.json({
        name: req.user.name,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        authenticated: true
    })
})
// if the user is authenticated
function protect (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(403).send();
    }
}

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
    var user = await users.findUserByDBId(id)
    done(null, user);
});
passport.use('provider', new OAuth2Strategy({
    authorizationURL: process.env.OAUTH2_AUTHORIZE || 'http://localhost:4000/o/authorize',
    tokenURL: process.env.OAUTH2_TOKEN || 'http://localhost:4000/o/token/',
    clientID: process.env.OAUTH2_CLIENTID || 'WadXCpA2EdzvHQNJWdEp5GvVqsCYxkF4gsJ72gtt',
    clientSecret: process.env.OAUTH2_CLIENTSECRET || 'Pnk2WxCR3rtUeHjvnmQgXFd5PkLvhpDvw0T6mluRrqasmNGB8M3km7SEi1ygBDaFyiWbD4QQda09cyYy9cnwJBupEFdfeFCk01haCUeVluFv0JpomskA1DXmPXSszQCg',
    callbackURL: process.env.OAUTH2_CALLBACK || 'http://localhost:8080/auth/provider/callback'
  },
  async function(accesstoken, refreshtoken, profile, done) {
    var profileEndpoint = process.env.DDOSDB_PROFILEINFO || 'http://localhost:4000/api/profileinfo'
    var req = await fetch(profileEndpoint, {
      headers: {
        Authorization: `Bearer ${accesstoken}`
      }
    })
    var userInfo = await req.json()
    var user =  await users.createOrUpdateUser(userInfo.id,
        userInfo.username,
        userInfo.email,
        userInfo.first_name,
        userInfo.last_name,
        accesstoken,
        refreshtoken)
	done(null, user)
  }
));

export { router, protect };
