'use strict'
var passport = require('passport');
var EvernoteStrategy = require('passport-evernote').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var Evernote = require('evernote').Evernote;
var crypto = require('crypto');
var notebooks;
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
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


            function(token, tokenSecret, profile, edam_noteStoreUrl, done) {


                //attempt to get username
               //app.get(function(req,res){
               //
               //     var client = new Evernote.Client({token: tokenSecret});
               //     //console.log(client);
               //     var userStore = client.getUserStore();
               //     userStore.getPublicUserinfo(function(err, usr){
               //
               //         console.log(usr, "user")l
               //     })
               //
               // });



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


    //get notebook
    app.get('/ebook/:id', function(req, res) {

        var client = new Evernote.Client({token: req.user.evernote.token});
        //console.log(client);
        var noteStore = client.getNoteStore();
        noteStore.listNotebooks(function (err, notebooks) {
            console.log(notebooks, "notebooks");
            res.json(notebooks);
        });

    });

    //get note from notebook
    app.get('/note/:id', function(req,res){

        var getNote = function(){
            var client = new Evernote.Client({token: req.user.evernote.token});
            var noteStore = client.getNoteStore();
            var noteFilter = new Evernote.NoteFilter;
            noteFilter.notebookGuid = req.params.id;
            var notesMetadataResultSpec = new Evernote.NotesMetadataResultSpec;
            notesMetadataResultSpec.includeTitle = true;
            notesMetadataResultSpec.includeCreated= true;
            noteStore.findNotesMetadata(noteFilter, 0, 100, notesMetadataResultSpec, function (err, notes) {

                if(err){
                    res.json("empty");

                }else{
                    var noteArr = notes.notes;
                    console.log(notes, "notes");
                    //console.log(notes, "notes");
                    //multiple notes but currently set up for first note in notebook
                    //for (var i=0; i < noteArr.length; i++) {
                    //console.log(noteArr[i]);
                    //console.log(noteArr[0.]created, "created")

                    var date = new Date(noteArr[0].created);
                    var time = date.toTimeString();
                    var d = date.toDateString();
                    var datecreated = "created on " + time + ' '+d;
                    //console.log( formattedTime, "formattedtime");

                    noteStore.getNoteContent(noteArr[0].guid, function(err, note){
                        console.log(note);
                        res.json({note : note, date: datecreated, title: noteArr[0].title, guid: noteArr[0].guid});
                    });
                }
            });
        }

        getNote();
    })



    app.get("/update/", function(req, res) {

        var client = new Evernote.Client({token: req.user.evernote.token});
        var noteStore = client.getNoteStore();
        //console.log(req, "req");
        //
        //var old_id = req.query.id
        //if(!req.query.id){
        //    req.query.id = old_id;
        //}

        noteStore.getNote(req.query.id, true, false, false, false, function (err, note) {
            console.log(note, "update note");
            var noteObj = note;
            var updateNotecontent = note.content;

            parseString(updateNotecontent, function (err, result) {

                //console.dir(JSON.stringify(result), "result");
                result['en-note'] += req.query.text;
                //console.dir(JSON.stringify(result), "appended");
                var builder = new xml2js.Builder();
                //console.log(builder, "before")
                builder.options.doctype = {sysID:'http://xml.evernote.com/pub/enml2.dtd'};
                builder.options.xmldec.standalone = null;
                //console.log(builder, "after")



                //var root = require('xmlbuilder').create('xbel',
                //    { version: '1.0', encoding: 'UTF-8'},
                //    { pubID: '+//IDN python.org//DTD XML Bookmark Exchange Language 1.0//EN//XML',
                //        sysID: 'http://www.python.org/topics/xml/dtds/xbel-1.0.dtd'
                //    }
                //);
                //The resulting XML will be:
                //
                //    <?xml version="1.0" encoding="UTF-8"?>
                //<!DOCTYPE xbel PUBLIC "+//IDN python.org//DTD XML Bookmark Exchange Language 1.0//EN//XML"
                //"http://www.python.org/topics/xml/dtds/xbel-1.0.dtd">
                //<xbel/>

                var updatedXMLcontent = builder.buildObject(result);
                updatedXMLcontent.toString();
                console.log(updatedXMLcontent, 'xmldcongdo');


                //
                //noteObj.content = updatedXMLcontent;
                //noteObj.contentLength = updatedXMLcontent.length;
                // noteObj.contentHash = null;
                //console.log(noteObj, "NOTEOBJ");
                //
                var client = new Evernote.Client({token: req.user.evernote.token});
                var noteStore = client.getNoteStore();
                var newNote = new Evernote.Note;
                newNote.guid = req.query.id;
                newNote.title = req.query.title;
                newNote.content = updatedXMLcontent;
                //noteObj.content = updatedXMLcontent;
                    noteStore.updateNote(newNote, function(err, update){
                        console.log(update, "updates")
                        var updatedNoteTitle = update.title;

                        noteStore.getNoteContent(req.query.id, function(err, note){
                            console.log(note);
                                 res.json({note:note, title:updatedNoteTitle, guid:req.query.id})
                                });

                    })

            });


            //var client = new Evernote.Client({token: req.user.evernote.token});
            //var noteStore = client.getNoteStore();
            //var newNote = new Evernote.Note;
            //console.log(req.query.id, req.query.text, req.query.title,"payload");
            //var md5 = crypto.createHash('md5');
            //var hashHex = md5.digest('hex');
            //// The content of an Evernote note is represented using Evernote Markup Language
            //// (ENML). The full ENML specification can be found in the Evernote API Overview
            //// at http://dev.evernote.com/documentation/cloud/chapters/ENML.php
            //newNote.guid = req.query.id;
            //newNote.title = req.query.title;
            //
            //    newNote.content = '<?xml version="1.0" encoding="UTF-8"?>';
            //    newNote.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
            //    newNote.content += '<en-note>';
            //    //newNote.content += '<div class ='+ '"' + counter + '"' + '>'+req.query.text+'</div>';
            //    newNote.content += req.query.text;
            //    newNote.content += '</en-note>';
            //counter ++;


            //noteStore.updateNote(updateNotecontent, function(err, update){
            //
            //    noteStore.getNoteSearchText(req.query.id,true, true, function(err, note){
            //        console.log(note);
            //        res.json({note :note});
            //    });
            //
            //});
            //    });
            //});


        })
    })
};

