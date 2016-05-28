chrome.storage.sync.get({
    users: []
}, function(items) {
    var posterIds = [];
    for (var i = 0; i < items.users.length; i++) {
        posterIds.push(items.users[i].userId);
    }
    mutePosts(posterIds);
});


function mutePosts(posterIds) {
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
                usernameTd.html(html + '<a href="javascript:void 0" class="muteUser" alt="Mute this user"><img style="height:20px" src="' + imgUrl + '"></a>');
            }
        }
    }
    //Register an onclick handler for all the mute buttons
    $(".muteUser").click(function() {
        var usernameTd = $(this).parent();
        var username = $(usernameTd.find('a')[1]).text();
        var link = $(usernameTd.find('a')[1]).attr('href');
        var userId = link.substring(33, link.length);

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
