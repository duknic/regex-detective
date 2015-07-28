function displayUserProgress(levelData) {
    // populate level progress bar
    var currentLevel = levelData.progress['maxLevel'];
    var totalScore = levelData.total_score;
    for (var i = 1; i < currentLevel; i++) {
        $('.bs-wizard-step:nth-child(' + i + ')').removeClass('disabled').addClass('complete');
        // grab all completed levels and give them a tick
        $('.btn-level-choose\[value=' + i + '\]').html('<span class=\"glyphicon glyphicon-ok-sign\" aria-hidden=\"true\"><\/span>' + '<br/>Level ' + i).addClass('level-complete');

    }
    $('.bs-wizard-step:nth-child(' + currentLevel + ')').removeClass('disabled').addClass('active');
    displayTotalScore(totalScore);
}

function displayTotalScore(totalScore) {
    // populate total score
    $({countNum: $('#totalScore').text()}).animate({countNum: totalScore}, {
        duration: 2000,
        easing: 'linear',
        step: function () {
            $('#totalScore').text(Math.ceil(this.countNum));
        },
        complete: function () {
            $('#counter').text(this.countNum);
        }
    });
}

function getValidScore(questionId, levelNum, questionScore, callback) {
    var level = "level" + levelNum.toString();
    var question = questionId + "";

    $.getJSON('/customData', function (data) {
        var recordedScore = data.progress[level][question].score;
        var score = recordedScore ? Math.min(recordedScore, questionScore) : questionScore;
        if (typeof callback == 'function') {
            if (score > 0) {
                callback(score);
            } else {
                callback(0);
            }
        }
    });
}

function rewardBadges(badgeArray) {
    badgeArray = JSON.parse(badgeArray);
    var last = (badgeArray.length - 1);

    $.each(badgeArray, function (index, value) {
        if (index == last) {
            makeBadgeModal(value, badgeArray[0]);
        } else {
            makeBadgeModal(value, null);
        }
    })
}

function makeBadgeModal(badge, lastElem) {
    $.get('/modal.html', function (data) {
        var badgeId = badge;

        $(data).appendTo('body').attr("id", ("badge" + badgeId));
        $modal = $("#badge" + badgeId);
        $modal.find('.modal-body').append("<img src=\"/images/badges/" + badgeId + ".png\" alt=\"badge icon\"/>");

        //if (typeof badge.btnLink != 'undefined') {
        //    $modal.find('a.modal-link').attr("href", badge.btnLink);
        //} else {
        var href = "#badge" + (badgeId + 1);
        console.log('adding link: ' + href);
        $modal.find('a.modal-link').attr("href", href);
        //}

        // TODO remember that this only works for badge id = 1!
        if (lastElem != null) {
            $('#badge' + lastElem).modal('show');
        }
    });
}


