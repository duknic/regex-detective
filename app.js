var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var customDataBlank = require('./public/customDataBlank.json');
var lessMiddleware = require('less-middleware');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/gamedb');

var routes = require('./routes/index');
var users = require('./routes/users');
var levels = require('./routes/levels');
var customData = require('./routes/customData');
var stats = require('./routes/stats');
var admin = require('./routes/admin');

var app = express();

// authentication
var stormpath = require('express-stormpath');
var clientTest = require('./node_modules/express-stormpath/node_modules/stormpath/lib/stormpath.js');

// CREATING STORMPATH CLIENT TO TALK TO REST API
var apiKeyFilePath = './apiKey.properties';
// Available after the properties file is asynchronously loaded from disk.
var client;
// CACHE STORMPATH API CALL DATA IN SERVER MEMORY
var cacheOptions = {
    store: 'memory',
    ttl: 120,
    tti: 300
};
clientTest.loadApiKey(apiKeyFilePath, function (err, apiKey) {
    client = new clientTest.Client({apiKey: apiKey, cacheOptions: cacheOptions});
});

// ### END STORMPATH CLIENT CREATION

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(stormpath.init(app, {
    expandCustomData: true,
    postLoginHandler: function (account, req, res, next) {
        console.log('Hey! ' + account.email + ' just logged in!');
        next();
    },
    postRegistrationHandler: function (account, req, res, next) {
        console.log('User:', account.email, 'just registered!');
        writeCustomDataToAccount(account, customDataBlank, null);
        next();
    },
    apiKeyFile: apiKeyFilePath,
    application: 'https://api.stormpath.com/v1/applications/49OK2eLCja2aZpbQaaOxYo',
    enableForgotPassword: true,
}));

app.use(lessMiddleware(__dirname + '/public'));
//app.use(express.static(__dirname + '/public'));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// make db accessible to router
app.use(function (req, res, next) {
    req.db = db;
    next();
});

// make client accessible to router by adding to request
app.use(function (req, res, next) {
    req.client = client;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/levels', levels);
app.use('/customData', customData);
app.use('/stats', stats);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {status: err.status, stack: 'you made the robot sad with you error, well done :('}
    });
});

hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

hbs.registerHelper('isEquals', function (e1, e2) {
    return (e1 == e2);
});

var writeCustomDataToAccount = function (account, dataToWrite, callback) {
    account.getCustomData(function (err, customData) {
        for (var i in dataToWrite) {
            customData[i] = dataToWrite[i];
        }
        customData.save(function (err) {
            account.getCustomData(function (err, customData) {
                if (typeof callback == 'function') {
                    callback(customData);
                }
            })
        });
    });
};

// TODO cite usage
function arrayDifference(a, b) {
    return a.filter(function (i) {
        return b.indexOf(i) < 0;
    });
}

var checkForBadges = function (customData, callback) {
    badgesForTotalScore(customData, function (data) {
        customData.badges = customData.badges.concat(data);
        if (typeof callback == 'function') {
            customData.save(function (err, data) {
                console.log('saving badges: ' + data.badges);
            });
            callback(JSON.stringify(data));
        }
    });
}

var badgesForTotalScore = function (customData, callback) {
    var badgesRewarded = [];
    var ts = customData.total_score;
    console.log('ts = ' + ts);

    if (ts > 14) {
        badgesRewarded.push(1);
    }
    if (ts > 24) {
        badgesRewarded.push(2);
    }
    if (ts > 49) {
        badgesRewarded.push(3);
    }
    if (ts > 99) {
        badgesRewarded.push(4);
    }
    if (ts > 199) {
        badgesRewarded.push(5);
    }
    if (ts > 399) {
        badgesRewarded.push(6);
    }
    if (ts > 699) {
        badgesRewarded.push(7);
    }
    if (ts > 999) {
        badgesRewarded.push(8);
    }

    if (typeof callback == 'function') {
        console.log('rewarded: ' + JSON.stringify(badgesRewarded) + '\nexisting: ' +
            JSON.stringify(customData.badges) + '\ndiff: ' + JSON.stringify(arrayDifference(badgesRewarded, customData.badges)));
        callback(arrayDifference(badgesRewarded, customData.badges));
    }
    //console.log('badges rewarded are: ' + badgesRewarded)
}

exports.checkForBadges = checkForBadges;
exports.writeCustomDataToAccount = writeCustomDataToAccount;

if (app.get('env') === 'production') {
    app.listen(80);
}


module.exports = app;
