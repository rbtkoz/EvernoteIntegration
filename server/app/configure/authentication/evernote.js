'use strict'
var passport = require('passport');
var EvernoteStrategy = require('passport-evernote').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var Evernote = require('evernote').Evernote;
var notebooks;
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
            // asynchronous verification, for effect...
            UserModel.findOne({ 'evernote.id': profile.edam_userId }).exec()
                .then(function (user) {

                    if (user) {
                        return user;
                    } else {
                        return UserModel.create({
                            evernote: {
                                id: profile.edam_userId,
                                token: token,
                                tokenSecret: tokenSecret,
                            }
                        });
                    }

                }).then(function (userToLogin) {
                    done(null, userToLogin);
                }, function (err) {
                    console.error('Error creating user from Evernote authentication', err);
                    done(err);
                })
            })
    )

    app.get('/auth/evernote',
        passport.authenticate('evernote'),
        function(req, res){
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
            //res.redirect('/ebook/'+req.user.evernote.id);
            res.redirect('/ebook');

        });



    app.get('/ebook/:id', function(req, res) {

        var client = new Evernote.Client({token: req.user.evernote.token});
        console.log(client);
        var noteStore = client.getNoteStore();
        noteStore.listNotebooks(function (err, notebooks) {
            console.log(notebooks, "notebooks");
            res.json(notebooks);
        });

    });

    app.get('/note/:id', function(req,res){

        var client = new Evernote.Client({token: req.user.evernote.token});
        console.log(req.user.evernote.token, "evernotetoken");
        console.log(client, "client");
        var noteStore = client.getNoteStore();

        filter = {notebookGuid : req.params.guid};

        console.log(noteStore, "noteStore");
        noteStore.findNotes(filter, function (err, notes) {
            console.log(err, "error")
            console.log(notes, "notebooks");
            res.json(notes);
        });
        //var client = new Evernote.Client({token:req.user.evernote.token});
        //var noteStore = client.getNoteStore();
        //console.log(req.params.id, "reqparamsid")
        //noteStore.getNote({guid:req.params.id, withContent:true }, function(err, notes){
        //    console.log(notes, "notes");
        //    res.json(notes);
        //})
    })
};

