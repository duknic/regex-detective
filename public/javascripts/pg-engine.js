/**
 * Created by nic on 22/07/2015.
 *
 * ### Component 1 contains  AND \. AND (whitespace)
 *              EDIT: taking . (dot) AND * out
 *
 * ### Component 2 contains (a|b) AND (a|b|c)
 *
 * ### Component 3 contains [ab] AND [abc] AND [abcd]
 *
 * ### Component 4 contains {2}, {3}, {4}
 *
 * ### Components Alpha and Numerical contain respective char arrays
 *
 * ### Component 5 contains [0-9] AND [a-z]
 *
 * ### Component 6 contains [^xy] AND [^xyz] AND [^xyzz]
 *
 */

// GLOBAL VARIABLES PER QUESTION
var curMatch = [];
var curNotMatch = [];
var curRegex = '';
var curProgenScore = 0;
var curDifficulty = 0;
var currentBadges = [];

// we could mess around with these arrays and put them into easy and advanced groups
// also, number of components is easy way of making questions more difficult
// every array has a space character so this is more commonly included in regex (this may or may not work)
var comp1 = ['\\.', ' '];
var comp2 = ['(a|b)', '(aa|bb)', '(aaa|bbb)', '(a|b|c)', '(aa|bb|cc)', '(aaa|bbb|ccc)', ' '];
var comp3 = ['[ab]', '[abc]', '[abcd]', '[a-z]', ' '];
var comp4 = ['{2}', '{3}', '{4}', ' '];
var compAlphaLo = 'abcdefghijklmnopqrstuvwxyz';
var compAlphaUp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var compAlphaAll = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var compNum = '0123456789';
var comp5 = ['[^xy]', '[^xyz]', '[^xyzz]', ' '];
var chars = 'aAbBcCdDeEfFgGhHiI jJkKlLmMnNoOpPqQrRsSt TuUvVwWxXyYzZ0123456789 ';
//var components = [comp1, comp2, comp3, comp4, compAlphaLo, compAlphaUp, compNum, comp5];
var components = [comp1, comp2, comp3, comp4, chars, comp5];

function generateRegex(numComps) {
    var regex = '';
    // control the first component choice to prevent straightforward string for string matching
    // OR just take single characters out?
    for (var i = 0; i <= numComps; i++) {
        var x = Math.floor(Math.random() * components.length);
        var xLength = components[x].length;
        var y = Math.floor(Math.random() * xLength);
        regex += components[x][y];
    }

    regex = replaceCharacters(regex.trim());
    curRegex = regex.trim();

    return curRegex;
}

function replaceCharacters(regex) {
    // iterate through and replace every alpha numerical character with random one including uppercase
    // we have to be careful of RANGES so check for [a- these keep their alpha or numerical type!
    // DONT worry about simple [abc] brackets these can be a mix

    console.log('regex before replace: ' + regex);
    // take out consecutive repetition operators e.g. abc{3}{4}
    // and replace with only one
    regex = regex.replace(/({\d} *){2,}/g, function (match, $1) {
        return $1.substr(0, 3)
    });

    // REMOVE REPEATED SPACE AT END OF EXPRESSION
    regex = regex.replace(/ +({\d})$/g, '$1');

    // remove repetition operator from start if exists
    // and replace with [abc] type component
    regex = regex.replace(/^{\d} */g, comp3[Math.floor(Math.random() * comp3.length)]);

    // split string into literal char array for easier iteration
    regex = regex.split('');

    var upperReg = new RegExp('[A-Z]');
    var lowerReg = new RegExp('[a-z]');
    var numReg = new RegExp('[0-9]');
    var allReg = new RegExp('[a-zA-Z0-9]');

    for (var i = 0, len = regex.length; i < len; i++) {
        // if c is a letter or number
        if (allReg.test(regex[i])) {
            // if c is part of a range
            if (regex[i - 1] == '-') {
                // replace c with whatever the start of the range had
                var char = regex[i - 2];
                if (upperReg.test(char)) {
                    regex[i] = findGreater(char, compAlphaUp);
                }
                else if (lowerReg.test(char)) {
                    regex[i] = findGreater(char, compAlphaLo);
                }
                else {
                    regex[i] = findGreater(char, compNum);
                }
            }
            // ELSE NOT IN A RANGE COMPONENT
            else {
                // IF NOT PART OF REPETITION OPERATOR
                if (!(regex[i - 1] == '{')) {
                    regex[i] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }
    }
    return regex.join('');
}


// calculates bonus points based on brevity of answer compared to curRegex
function calculateBonusPoints(answer, cb) {
    var bonus = curRegex.length - answer.length;
    if (typeof cb == 'function') {
        cb(bonus);
    }
}

// returns a char of greater value than the one you pass in i.e. z > a
function findGreater(char, arr) {

    // cut searchable array down to range greater than char
    arr = arr.substring(arr.indexOf(char) + 1);
    return arr[Math.floor(Math.random() * arr.length)];

}

function getMatchList(numStr, regex) {

    var matchArr = [];
    while (numStr--) {
        matchArr.push(new RandExp(regex).gen().trim());
    }
    curMatch = matchArr;
    return matchArr;
}

function getNotMatchList(numStr, regex) {
    var notMatch = [];
    var strLength = curMatch[0].length;
    var str = randomStr(strLength);
    var tester = new RegExp(regex);
    while (!tester.test(str) && notMatch.length < numStr) {
        notMatch.push(str);
        str = randomStr(strLength);
    }
    curNotMatch = notMatch;
    return notMatch;
}

function randomStr(length) {
    var str = '';
    while (length--) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

function generateProgen(difficulty) {
    $('#submitBtn').removeClass('disabled').prop('disabled', false);
    $('.modal').remove();
    curDifficulty = difficulty;
    curProgenScore = 2 * difficulty;
    $('#questionPts').text(curProgenScore + ' pts');
    var regex = generateRegex(difficulty);
    var match = getMatchList(difficulty, regex);
    var notMatch = getNotMatchList(difficulty, regex);
    $tbody = $('#testCases');

    for (var i = 0; i < match.length; i++) {
        //match[i] = match[i].replace(/ /g, '&nbsp;');
        $tbody.append(
            '<tr><td>' + match[i].replace(/ /g, '&nbsp;') + '</td> <td>' + notMatch[i] + '</td></tr>'
        )
    }
    $('#bonusPoints').html('current bonus: ' + (curRegex.length) + ' pts').removeClass('neg').addClass('pos');
}

function checkProgenAnswer() {
    var answer = $('#answerBox').val();
    var regex = new RegExp(answer);
    var passed = true;
    curMatch.forEach(function (str) {
        passed = passed && regex.test(str);
    });
    curNotMatch.forEach(function (str) {
        passed = passed && !(regex.test(str));
    });
    if (passed) {
        $('#submitBtn').addClass('disabled').prop('disabled', true);
        //writeFeedback('Yep, that works!\nOur answer was \"' + curRegex + '\"', true);
        calculateBonusPoints(answer, function (bonus) {
            writeFeedback('Yep, that works!<br/>Our answer was \"' + curRegex + '\"<br/>You were awarded ' + bonus + ' bonus pts!', true);
            recordProgen(curProgenScore + bonus);
        })
        $('#nextButton').addClass('shake');
    } else {
        writeFeedback('Hmmm, that doesn\'t seem to work, try again!', false);
        curProgenScore -= 2;
        $('#questionPts').text(curProgenScore + ' pts');
    }
}

function recordProgen(score) {
    var newData = new Object();
    $.getJSON('/customData/total_score', function (data) {
        newData.total_score = data + score;
        console.log('total_score = ' + newData.total_score)
        displayTotalScore(newData.total_score);
    });
    $.getJSON('/customData/progenAnswered', function (data) {
        newData.progenAnswered = data + 1;

        // send data to server
        $.ajax({
            url: "/updateUserProgress",
            type: "POST",
            data: JSON.stringify(newData),
            contentType: "application/json; charset=utf-8",
            //dataType: "json",
            success: function (data, res, jqXHR) {
                //console.log('data is: ' + data);
                rewardBadges(data, false);
                console.log('posted levelData to server and got...' +
                    '\n      response: ' + res);
            }
        });
    });
}

/*
 * writeFeedback:
 * displays a panel on the question page. Takes text to add to the body of the panel
 * and also a boolean to say where answer is right or wrong.
 */
function writeFeedback(text, isCorrect) {
    var out = "";
    if (isCorrect) {
        out = "<div class=\"panel panel-success\" id=\"thisPanel\"><div class=\"panel-heading\"><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"><\/span>CORRECT" +
            "<button type=\"button\" class=\"close\" data-target=\"#thisPanel\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;<\/span><\/button><\/div>" +
            "<div class=\"panel-body\" aria-hidden=\"true\">" + text + "</div><\/div>";

    } else {
        out = "<div class=\"panel panel-danger\" id=\"thisPanel\"><div class=\"panel-heading\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"><\/span>WRONG" +
            "<button type=\"button\" class=\"close\" data-target=\"#thisPanel\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;<\/span><span class=\"sr-only\">Close<\/span><\/button><\/div>" +
            "<div class=\"panel-body\" aria-hidden=\"true\">" + text + "</div><\/div>";
    }
    $('#msg-box').empty().append(out);
}

$(function () {
    $('#answerBox').keyup(function () {
        var bonus = curRegex.length - $(this).val().length;
        if (bonus >= 0) {
            $('#bonusPoints').html('current bonus: ' + bonus + ' pts').removeClass('neg').addClass('pos');
        } else {
            $('#bonusPoints').html('current bonus: ' + bonus + ' pts').removeClass('pos').addClass('neg');
        }
    })
})

