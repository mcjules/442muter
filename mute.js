if (location.search.split('g=')[1].split("&")[0] == "posts" || location.search.split('g=')[1].split("&")[0] == "topics" || location.search.split('g=')[1].split("&")[0] == "active") {
    chrome.storage.sync.get({
        users: [],
        threads: [],
        muteQuotes: false
    }, function(items) {
        $('p.navlinks').append('<span style="position: absolute; right: 1em;"><a href="javascript:void 0" id="showMuteButtons">Show mute buttons</a><a href="javascript:void 0" id="hideMuteButtons" style="display:none">Hide mute buttons</a>');
        $('#showMuteButtons').click(function() {
            $(".muteThread").show();
            $(".muteUser").show();
            $('#showMuteButtons').hide();
            $('#hideMuteButtons').show();
        });
        $('#hideMuteButtons').click(function() {
            $(".muteThread").hide();
            $(".muteUser").hide();
            $('#hideMuteButtons').hide();
            $('#showMuteButtons').show();
        });
        if (location.search.split('g=')[1].split("&")[0] == "posts") {
            var posterIds = [];
            var posterNames = [];
            for (var i = 0; i < items.users.length; i++) {
                posterIds.push(items.users[i].userId);
                posterNames.push(items.users[i].username);
            }
            mutePosts(posterIds, posterNames, items.muteQuotes);
        } else {
            var threadIds = [];
            for (var i = 0; i < items.threads.length; i++) {
                threadIds.push(items.threads[i].threadId);
            }
            muteThreads(threadIds);
        }
    });
}

function muteThreads(threadIds) {
    var tableRows = $('table[class="content"][cellspacing="1"]').children('tbody').children('tr');
    var mutedThreadCounter = 0;
    var statusRows = [];
    for (i = 0; i < tableRows.length; i++) {
        var blockedThread = false;
        if ($(tableRows[i]).attr('class') != null && $(tableRows[i]).attr('class').indexOf("post") == 0) {
            for (j = 0; j < threadIds.length; j++) {
                var thread = $(tableRows[i]).find('[href^="/forums/default.aspx?g=posts&t=' + threadIds[j] + '"]');
                if (thread.length > 0) {
                    $(tableRows[i]).remove();
                    mutedThreadCounter++;
                    blockedThread = true;
                    break;
                }
            }
            if (!blockedThread) {
                var imgUrl = chrome.extension.getURL("images/music_off.png");
                $($(tableRows[i]).children('td')[1]).children('a[class="post_link"]').after('<a href="javascript:void 0" class="muteThread" style="display:none" alt="Mute this user"><img style="height:20px" src="' + imgUrl + '"></a>');
            }
        }
        if (i > tableRows.length - 4) {
            statusRows.push(tableRows[i]);
            $(tableRows[i]).remove();
        }
    }
    var threadTableBody = $('table[class="content"][cellspacing="1"]').children('tbody');
    if (threadTableBody.length > 1) {
        threadTableBody = $(threadTableBody[1]);
    }
    for (i = 0; i < mutedThreadCounter; i++) {
        threadTableBody.append('<tr class="post_alt"><td></td><td>Muted<br></td><td></td><td align="center"></td><td align="center"></td><td align="center" class="smallfont"></td></tr>');
    }
    for (i = 0; i < statusRows.length; i++) {
        threadTableBody.append(statusRows[i]);
    }

    //Register an onclick handler for all the mute buttons
    $(".muteThread").click(function() {
        var threadTd = $(this).parent();
        var threadName = $(threadTd.find('a[class="post_link"]')[0]).text();
        var link = $(threadTd.find('a[class="post_link"]')[0]).attr('href');
        var threadId = link.split('t=')[1].split("&")[0];

        chrome.storage.sync.get({
            threads: []

        }, function(items) {
            var threads = items.threads;
            threads.push({
                'threadId': threadId,
                'threadName': threadName
            });
            items.threads = threads;
            chrome.storage.sync.set(items, function() {
                location.reload();
            });
        });
    });

}

function mutePosts(posterIds, posterNames, muteQuotes) {
    var tableRows = $('table[class="content"][cellspacing="1"]').children('tbody').children('tr');

    var blockedPost = false;
    for (i = 0; i < tableRows.length; i++) {

        if (blockedPost) {
            //We've checked the header row and it's from a muted user so block the post.
            $($(tableRows[i]).children()[0]).html('');
            $($(tableRows[i]).children()[1]).html('');
            blockedPost = false;
        }
        //If it's the header row of a post. Check whether the post is by a muted user.
        if ($(tableRows[i]).attr('class') == 'postheader') {
            for (j = 0; j < posterIds.length; j++) {
                var poster = $(tableRows[i]).find('[href="/forums/default.aspx?g=profile&u=' + posterIds[j] + '"]');
                if (poster.length > 0) {
                    poster.parent().html("Muted");
                    $($(tableRows[i]).children()[1]).html('');
                    blockedPost = true;
                    break;
                }

            }
            //If it isn't a blocked post, add the mute button next to the username
            if (!blockedPost) {
                var usernameTd = $($(tableRows[i]).children()[0]);
                var username = $(usernameTd.find('a')[1]).text();
                var link = $(usernameTd.find('a')[1]).attr('href');
                var userId = link.substring(33, link.length);
                var html = usernameTd.html();
                var imgUrl = chrome.extension.getURL("images/music_off.png");
                usernameTd.html(html + '<a href="javascript:void 0" class="muteUser" style="display:none" alt="Mute this user"><img style="height:20px" src="' + imgUrl + '"></a>');
            }
        } else {
            if (muteQuotes && !blockedPost) {
                //Read post to see if blocked name is being quoted
                if ($(tableRows[i]).attr('class') == 'post' || $(tableRows[i]).attr('class') == 'post_alt') {
                    var postDiv = $(tableRows[i]).children('td[class="message"]');
                    var quotes = postDiv.find('div[class="quote"] > b');
                    var foundQuoter = false;
                    for (var j = 0; j < quotes.length; j++) {
                        var quoterText = $(quotes[j]).text();
                        var quoterName = quoterText.substring(0, quoterText.length - 7);
                        if (foundQuoter) {
                            break;
                        }
                        for (var k = 0; k < posterNames.length; k++) {
                            if (quoterName == posterNames[k]) {
                                var post = postDiv.children('div[class="postdiv"]');
                                var showLink = $("<a href='javascript: 0'>Show the post</a>");
                                post.before(showLink);
                                post.hide();
                                postDiv.children('a').click(
                                    function() {
                                        $(this).parent().children('div[class="postdiv"]').show();
                                        $(this).hide();
                                    });
                                foundQuoter = true;
                                break;
                            }
                        }

                    }
                }

            }

        }
    }
    //Register an onclick handler for all the mute buttons
    $(".muteUser").click(function() {
        var usernameTd = $(this).parent();
        var username = $(usernameTd.find('a')[1]).text();
        var link = $(usernameTd.find('a')[1]).attr('href');
        var userId = link.split('u=')[1].split("&")[0];

        chrome.storage.sync.get({
            ids: '',
            users: []

        }, function(items) {
            var users = items.users;
            users.push({
                'userId': userId,
                'username': username
            });
            items.users = users;
            chrome.storage.sync.set(items, function() {
                location.reload();
            });
        });
    });
}
