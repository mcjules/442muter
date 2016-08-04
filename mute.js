var pageType = detectPage();
if (pageType != null) {
    chrome.storage.sync.get({
        users: [],
        threads: [],
        muteQuotes: false,
        moderniseYoutubeVids: false,
        youtubeVideoHeight: 360,
        youtubeVideoWidth: 640
    }, function(items) {


        if (pageType == "thread") {
            $('div.i-pager').prepend('<span><a href="javascript:void 0" class="showMuteButtons">Show mute buttons</a><a href="javascript:void 0" class="hideMuteButtons" style="display:none">Hide mute buttons</a>');
            var posterIds = [];
            var posterNames = [];
            for (var i = 0; i < items.users.length; i++) {
                posterIds.push(items.users[i].userId);
                posterNames.push(items.users[i].username);
            }
            mutePosts(posterIds, posterNames, items.muteQuotes);

            if (items.moderniseYoutubeVids) {
                var youtubeVids = $("param[value^='http://www.youtube.com']");
                for (var i = 0; i < youtubeVids.length; i++) {
                    var urlComponents = $(youtubeVids[i]).val().split('/');
                    var vidId = urlComponents[urlComponents.length - 1];
                    if (vidId.indexOf("watch?v=") == 0) {
                        vidId = vidId.substring(8, vidId.length);
                    }
                    if (vidId.indexOf("httpwatch?v=") == 0) {
                        vidId = vidId.substring(8, vidId.length);
                    }
                    if(vidId.indexOf('&fs=1') != -1) {
                     firstPart = vidId.substring(0,vidId.indexOf('&fs=1'));
                     secondPart = vidId.substring(vidId.indexOf('&fs=1')+5,vidId.length);
                     vidId = firstPart+secondPart;
                    }
                    if(vidId.indexOf('&hl=en') != -1) {
                     firstPart = vidId.substring(0,vidId.indexOf('&hl=en'));
                     secondPart = vidId.substring(vidId.indexOf('&hl=en')+6,vidId.length);
                     vidId = firstPart+secondPart;
                    }
                    if(vidId.charAt(vidId.length-1) == "&") {
                      vidId = vidId.substring(0,vidId.length-1);
                    }
                    var parentElement = $(youtubeVids[i]).parent();
                    parentElement.after('<iframe width="' + items.youtubeVideoWidth + '" height="' + items.youtubeVideoHeight + '" src="https://www.youtube.com/embed/' + vidId + '" frameborder="0" allowfullscreen></iframe>');
                    parentElement.remove();
                }
            }
        } else {
            $('span.i-pager').prepend('<span><a href="javascript:void 0" class="showMuteButtons">Show mute buttons</a><a href="javascript:void 0" class="hideMuteButtons" style="display:none">Hide mute buttons</a>');
            var threadIds = [];
            for (var i = 0; i < items.threads.length; i++) {
                threadIds.push(items.threads[i].threadId);
            }
            muteThreads(threadIds);
        }
        $('.showMuteButtons').click(function() {
            $(".muteThread").show();
            $(".muteUser").show();
            $('.showMuteButtons').hide();
            $('.hideMuteButtons').show();
        });
        $('.hideMuteButtons').click(function() {
            $(".muteThread").hide();
            $(".muteUser").hide();
            $('.hideMuteButtons').hide();
            $('.showMuteButtons').show();
        });

    });
}

function muteThreads(threadIds) {
    var tableRows = $('table.i-table.if-topic-list').find('tr[id!=""][id]');
    var mutedThreadCounter = 0;
    var statusRows = [];
    for (i = 0; i < tableRows.length; i++) {
        var blockedThread = false;
            var threadId = $(tableRows[i]).attr('id').substring(7,$(tableRows[i]).attr('id').length)

            for (j = 0; j < threadIds.length; j++) {

                if (threadId == threadIds[j]) {
                    $(tableRows[i]).remove();
                    mutedThreadCounter++;
                    blockedThread = true;
                    break;
                }
            }
            if (!blockedThread) {
                var imgUrl = chrome.extension.getURL("images/music_off.png");
                var threadName = $($($(tableRows[i]).children('td')[3]).find('a')[0]).text();
                $($($(tableRows[i]).children('td')[3]).find('a')[0]).after('<a href="javascript:void 0" threadName="'+threadName+'" threadId="'+threadId+'"class="muteThread" style="display:none" alt="Mute this thread"><img style="height:20px" src="' + imgUrl + '"></a>');
            }


    }

    //Register an onclick handler for all the mute buttons
    $(".muteThread").click(function() {
        var threadName = $(this).attr('threadName');

        var threadId = $(this).attr('threadId');

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
    var tableRows = $("div > table.if-topic").children('tbody').children('tr');

    var blockedPost = false;
    for (i = 0; i < tableRows.length; i++) {

        if (blockedPost) {
            //We've deleted the post now lets hide the reply buttons
            $($(tableRows[i]).children()[0]).html('');
            $($(tableRows[i]).children()[1]).html('');
            blockedPost = false;
        }

        var postElements = $(tableRows[i]).find('td[style="vertical-align: top;"]');
        //If it's the header row of a post. Check whether the post is by a muted user.
        if (postElements.length > 0) {

            var onmouseover = $(postElements[0]).find('div.i-photo').find('span').attr('onmouseover');
            if(onmouseover != null) {
            var endPart = onmouseover.substring(onmouseover.indexOf('showUserCard(')+13,onmouseover.length);
            var posterId = endPart.substring(0,endPart.indexOf(','))

            for (j = 0; j < posterIds.length; j++) {

                if (posterIds[j] == posterId) {
                    $($(postElements[0]).parent().prev().children('td')[0]).html("Muted");
                    $($(postElements[0]).parent().prev().children('td')[1]).html("");
                    $(postElements[0]).html("");
                    $(postElements[1]).html("");
                    blockedPost = true;
                    break;
                }

            }

            //If it isn't a blocked post, add the mute button next to the username
            if (!blockedPost) {
                var usernameTd = $($(postElements[0]).parent().prev().children('td')[0]);
                var username = $(usernameTd.find('a')[1]).text();

                var html = usernameTd.html();
                var imgUrl = chrome.extension.getURL("images/music_off.png");
                usernameTd.html(html + '<a href="javascript:void 0" class="muteUser" username="'+username+'" userId="'+posterId+'" style="display:none" alt="Mute this user"><img style="height:20px" src="' + imgUrl + '"></a>');
            }
            }
        } else {
            //TODO: reimplement
            // if (muteQuotes && !blockedPost) {
            //     //Read post to see if blocked name is being quoted
            //     if ($(tableRows[i]).attr('class') == 'post' || $(tableRows[i]).attr('class') == 'post_alt') {
            //         var postDiv = $(tableRows[i]).children('td[class="message"]');
            //         var quotes = postDiv.find('div[class="quote"] > b');
            //         var foundQuoter = false;
            //         for (var j = 0; j < quotes.length; j++) {
            //             var quoterText = $(quotes[j]).text();
            //             var quoterName = quoterText.substring(0, quoterText.length - 7);
            //             if (foundQuoter) {
            //                 break;
            //             }
            //             for (var k = 0; k < posterNames.length; k++) {
            //                 if (quoterName == posterNames[k]) {
            //                     var post = postDiv.children('div[class="postdiv"]');
            //                     var showLink = $("<a href='javascript: 0'>Show the post</a>");
            //                     post.before(showLink);
            //                     post.hide();
            //                     postDiv.children('a').click(
            //                         function() {
            //                             $(this).parent().children('div[class="postdiv"]').show();
            //                             $(this).hide();
            //                         });
            //                     foundQuoter = true;
            //                     break;
            //                 }
            //             }
            //
            //         }
            //     }
            //
            // }

        }
    }


    //Register an onclick handler for all the mute buttons
    $(".muteUser").click(function() {
        var userId = $(this).attr('userId');
        var username = $(this).attr('username');

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


function detectPage() {
  var forumText = $("a#hypSort_Title").text().trim();
  if(forumText == "Topics"){
    return "forum";
  }
  var topicsText = $(".if-post-col-right.i-col-header").text().trim();

  if(topicsText == "Message"){
    return "thread";
  }

  return null;
}
