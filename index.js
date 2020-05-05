const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser')
const url = 'https://passport.psu.ac.th/authentication/authentication.asmx?wsdl';
const app = express()
const router = express.Router()
const cors = require('cors');
const PORT = process.env.PORT || 4000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use('/api', bodyParser.json(), router)   //[use json]
app.use('/api', bodyParser.urlencoded({ extended: false }), router)
var firebase = require('firebase')
var myKey = "&J)%(L:MF#^%$#&%^78GGL235G)(T"

const firebaseConfig = {
    apiKey: "AIzaSyDS3UaX3BHpuR9nkgGPEXNwsRz4ZajS6c0",
    authDomain: "psupktmaterial.firebaseapp.com",
    databaseURL: "https://psupktmaterial.firebaseio.com",
    projectId: "psupktmaterial",
    storageBucket: "psupktmaterial.appspot.com",
    messagingSenderId: "673539716089",
    appId: "1:673539716089:web:67e7cce961c3cab2"
}

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

router.route('/')
    .get((req, res) => {
        res.send('hello')
    })
    .post((req, res) => {
        let admin = {}
        admin.username = req.body.username
        admin.password = req.body.password
        if (admin.username == "admin" && admin.password == "psumaterial2019") {
            var objAdmin = {
                username: "psu passport",
                token: "token"
            }
            objAdmin.username = admin.username
            let dateStringAdmin = ""
            let dateAdmin = new Date()
            dateStringAdmin = dateAdmin + admin.username + myKey
            let decodeAdmin = dateStringAdmin;
            let buffAdmin = Buffer.from(decodeAdmin)
            let base64dataAdmin = buffAdmin.toString('base64');
            objAdmin.token = base64dataAdmin

            database.ref('users').child(admin.username).once("value", snapshot => {

                if (snapshot.exists()) {
                    console.log('already exists')
                    database.ref('users/' + admin.username).set({
                        user: objAdmin.username,
                        token: base64dataAdmin
                    }).then(() => {
                        res.send(objAdmin)
                    }).catch(err => {
                        console.log(err)
                        res.send(err)
                    })

                } else {
                    console.log("don't have")
                    database.ref('users/' + admin.username).set({
                        user: objAdmin.username,
                        token: base64dataAdmin
                    }).then(() => {
                        res.send(objAdmin)
                        return false
                    }).catch(err => {
                        console.log(err)
                        res.send(err)
                    })
                }
            })

        } else {

            soap.createClient(url, (err, client) => {
                if (err)
                    console.error(err);
                else {
                    let user = {}
                    user.username = req.body.username
                    user.password = req.body.password

                    client.GetStaffDetails(user, (err, response) => {
                        let username = user.username.split(".", 1)
                        if (response.GetStaffDetailsResult.string[0] == "") {
                            res.send("wrong user or password")
                            console.error("it err", err)
                        }
                        else {
                            console.log("Show_profile ", response)
                            let data = response.GetStaffDetailsResult.string;
                            var obj = {
                                username: "psu passport",
                                token: "token"
                            }
                            obj.username = data[1] + "  " + data[2]
                            let dateString = ""
                            let date = new Date()
                            dateString = data[0] + date + user.username
                            let decode = dateString;
                            let buff = Buffer.from(decode)
                            let base64data = buff.toString('base64');
                            obj.token = base64data
                            database.ref('users').child(username[0]).once("value", snapshot => {

                                if (snapshot.exists()) {
                                    var email = user.username + "@email.com"
                                    auth.fetchSignInMethodsForEmail(email)
                                        .then((signInMethods) => {
                                            if (signInMethods.indexOf(
                                                firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
                                                console.log('already exists')
                                                database.ref('users/' + username[0]).set({
                                                    user: obj.username,
                                                    token: base64data
                                                }).then(() => {
                                                    res.send(obj)

                                                }).catch(e => {
                                                    console.log(e)
                                                    res.send(e)
                                                })
                                            } else {
                                                auth.createUserWithEmailAndPassword(email, user.password)
                                                    .then(() => {
                                                        console.log('already exists')
                                                        database.ref('users/' + username[0]).set({
                                                            user: obj.username,
                                                            token: base64data
                                                        }).then(() => {
                                                            res.send(obj)

                                                        }).catch(e => {
                                                            console.log(e)
                                                            res.send(e)
                                                        })
                                                    })
                                            }
                                        })
                                } else {
                                    var email = user.username + "@email.com"
                                    auth.fetchSignInMethodsForEmail(email)
                                        .then((signInMethods) => {
                                            if (signInMethods.indexOf(
                                                firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
                                                database.ref('users/' + username[0]).set({
                                                    user: obj.username,
                                                    token: base64data
                                                }).then(() => {
                                                    res.send(obj)
                                                }).catch(e => {
                                                    console.log(e)
                                                    res.send(e)
                                                })
                                                // User can sign in with email/password.
                                            } else {
                                                auth.createUserWithEmailAndPassword(email, user.password)
                                                    .then(() => {
                                                        console.log("don't have")
                                                        database.ref('users/' + username[0]).set({
                                                            user: obj.username,
                                                            token: base64data
                                                        }).then(() => {
                                                            res.send(obj)
                                                        }).catch(e => {
                                                            console.log(e)
                                                            res.send(e)
                                                        })
                                                    })
                                                    .catch(function (error) {
                                                        var errorCode = error.code;
                                                        var errorMessage = error.message;
                                                        console.log("error", errorCode, errorMessage)
                                                    })
                                            }
                                        })

                                }
                            })
                        }
                    });
                }
            });
        }
    })

app.listen(PORT, () => console.log('Server is ready!'))