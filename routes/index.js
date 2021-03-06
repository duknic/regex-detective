var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var app = require('../app');

/* GET home page. */
router.get('/', function (req, res) {
    var userName = "";
    var isLoggedOut = false;
    if (typeof req.user != 'undefined') {
        userName = req.user.givenName;
    } else {
        isLoggedOut = true;
    }
    res.render('index', {
        title: 'Home',
        pageClass: 'home',
        isHome: true,
        isLoggedOut: isLoggedOut,
        givenName: userName
    });
});

// get userdata from client and update database
router.post('/updateUserProgress', stormpath.loginRequired, function (req, res) {
    app.writeCustomDataToAccount(req.user, req.body, function (newData) {
        app.checkForBadges(newData, function (badges) {
            res.status(200).json(badges);
        });
        console.log("server received updated user data");
    });
});

router.post('/recordMisconception/:qId/:isCorrect', stormpath.loginRequired, function (req, res) {
    var db = req.db;
    var misconceptions = db.get('misconceptions');
    var qId = decodeURIComponent(req.params.qId);
    var isCorrect = decodeURIComponent(req.params.isCorrect);
    var answer = req.body.answer;
    misconceptions.insert(
        {
            "userEmail": req.user.email,
            "questionId": qId,
            "isCorrect": isCorrect,
            "answer": answer,
            "dateTime": new Date().toISOString()
        },
        function (err, doc) {
            if (err) throw err;
            res.status(200).send('logged misconception');
        });

});

router.get('/usability', function(req, res){
    var userName = "";
    var isLoggedOut = false;
    if (typeof req.user != 'undefined') {
        userName = req.user.givenName;
    } else {
        isLoggedOut = true;
    }
    res.render('usability', {
        title: 'Usability survey',
        pageClass: 'usability',
        isLoggedOut: isLoggedOut,
        givenName: userName
    });
})

router.post('/submitUsabilityForm', function(req, res){
    var db = req.db;
    var usability = db.get('usability');
    usability.insert(
        {
            "sus1": req.body.sus1,
            "sus2": req.body.sus2,
            "sus3": req.body.sus3,
            "sus4": req.body.sus4,
            "sus5": req.body.sus5,
            "sus6": req.body.sus6,
            "sus7": req.body.sus7,
            "sus8": req.body.sus8,
            "sus9": req.body.sus9,
            "sus10": req.body.sus10,
            "agreement": req.body.agreement,
            "browser": req.headers['user-agent'],
            "dateTime": new Date().toISOString()
        },
        function (err, doc) {
            if (err) throw err;
            res.status(200).send('logged usability feedback');
        });
});

router.post('/submitFeedback', function (req, res) {
    var db = req.db;
    var feedback = db.get('feedback');
    feedback.insert(
        {
            "didLearn": req.body.didLearn,
            "arcadeMode": req.body.arcadeMode,
            "gamification": req.body.gamification,
            "moreQuestions": req.body.moreQuestions,
            "freeComment": req.body.freeComment,
            "agreement": req.body.agreement,
            "browser": req.headers['user-agent'],
            "dateTime": new Date().toISOString()
        },
        function (err, doc) {
            if (err) throw err;
            res.status(200).send('logged feedback');
        });
});

module.exports = router;
