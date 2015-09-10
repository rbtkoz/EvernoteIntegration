'use strict'
var passport = require('passport');
var EvernoteStrategy = require('passport-evernote').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var Evernote = require('evernote').Evernote;



module.exports = function(app){

    var evernoteConfig = app.getValue('env').EVERNOTE;

    var evernoteCredentials = {
        EVERNOTE_CONSUMER_KEY : evernoteConfig.consumerKey,
        EVERNOTE_CONSUMER_SECRET: evernoteConfig.consumerSecret

    };

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Evernote profile is
//   serialized and deserialized.

    passport.serializeUser(function(user, done) {
    done(null, user);
    });
    //
    passport.deserializeUser(function(obj, done) {
    done(null, obj);
    });

    // Use the EvernoteStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Evernote profile), and
//   invoke a callback with a user object.

    passport.use(new EvernoteStrategy({
        requestTokenURL: 'https://sandbox.evernote.com/oauth',
        accessTokenURL: 'https://sandbox.evernote.com/oauth',
        userAuthorizationURL: 'https://sandbox.evernote.com/OAuth.action',
        consumerKey: evernoteCredentials.EVERNOTE_CONSUMER_KEY,
        consumerSecret: evernoteCredentials.EVERNOTE_CONSUMER_SECRET,
        callbackURL: "http://localhost:1337/auth/evernote/callback"
    },
    function(token, tokenSecret, profile,edam_noteStoreUrl, done) {

        console.log("token :",token, "tokenSecret :",tokenSecret, "profile :", profile, "done :", done, edam_noteStoreUrl);

        var client = new Evernote.Client({token: token});
        var noteStore = client.getNoteStore();
        var notebooks = noteStore.listNotebooks(function(err, notebooks) {
            console.log(notebooks, "notebooks");
        });


        // asynchronous verification, for effect...
        UserModel.findOne({ 'evernote.id': profile.id }).exec()
            .then(function (user) {

                if (user) {
                    return user;
                } else {
                    return UserModel.create({
                        evernote: {
                            id: profile.id
                        }
                    });
                }

            }).then(function (userToLogin) {
                done(null, userToLogin);
            }, function (err) {
                console.error('Error creating user from Facebook authentication', err);
                done(err);
            })
    })
)
    app.get('/auth/evernote',
        passport.authenticate('evernote'),
        function(req, res){
            res.json("cold");
            // The request will be redirected to Evernote for authentication, so this
            // function will not be called.
        });

// GET /auth/evernote/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
    app.get('/auth/evernote/callback',
        passport.authenticate('evernote', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/ebook');
        });

};