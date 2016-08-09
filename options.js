// Saves options to chrome.storage
function save_options() {
    records.muteQuotes = $("#muteQuotes")[0].checked;
    records.moderniseYoutubeVids =$("#moderniseYoutubeVids")[0].checked;
    records.youtubeVideoHeight= $('#layout-options option:selected').attr('data-height');
    records.youtubeVideoWidth= $('#layout-options option:selected').attr('data-width');
    records.fixAvatars =$("#fixAvatars")[0].checked;
    records.squareAvatars =$("#squareAvatars")[0].checked;
    records.avatarWidth =$("#avatarWidth").val();
    records.avatarHeight =$("#avatarHeight").val();
    chrome.storage.sync.set(records, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
            location.reload();
        }, 750);
    });
}

function removeUser() {
    var index = $(this).attr('index');
    records.users.splice(index, 1);
    save_options();
}

function removeThread() {
    var index = $(this).attr('index');
    records.threads.splice(index, 1);
    save_options();
}


var records = null;

function restore_options() {
    chrome.storage.sync.get({
        ids: '',
        users: [],
        threads: [],
        muteQuotes: false,
        moderniseYoutubeVids:false,
        youtubeVideoHeight:360,
        youtubeVideoWidth:640,
        fixAvatars: false,
        squareAvatars: false,
        avatarWidth: '72',
        avatarHeight: '72'
    }, function(items) {
        records = items;
        if (items.users.length == 0) {
            $('#userBody').parent().after("<div>No users are currently muted</div>");
            $('#userBody').parent().remove();
        }

        for (var i = 0; i < items.users.length; i++) {
            $('#userBody').append($('<tr>').append($('<td>').text(items.users[i].username)).append($('<td>').text(items.users[i].userId)).append($('<td>').html("<a class='removeUserLink' href='javascript:void 0' index='" + i + "'>Remove</a>")));
        }
        $('.removeUserLink').click(removeUser);

        if (items.threads.length == 0) {
            $('#threadBody').parent().after("<div>No threads are currently muted</div>");
            $('#threadBody').parent().remove();
        }
        for (var i = 0; i < items.threads.length; i++) {
            $('#threadBody').append($('<tr>').append($('<td>').text(items.threads[i].threadName)).append($('<td>').text(items.threads[i].threadId)).append($('<td>').html("<a class='removeThreadLink' href='javascript:void 0' index='" + i + "'>Remove</a>")));
        }
        $('.removeThreadLink').click(removeThread);
        $("#muteQuotes")[0].checked = items.muteQuotes;
        $("#moderniseYoutubeVids").change(function() {
            if(this.checked == true) {
              $('#layout-options').show();
            } else {
              $('#layout-options').hide();
            }
        })
        $("#moderniseYoutubeVids")[0].checked = items.moderniseYoutubeVids;
        $("#moderniseYoutubeVids").change();
        $('#layout-options option[data-height='+items.youtubeVideoHeight+']').attr('selected','selected');
        $("#fixAvatars").change(function() {
            if(this.checked == true) {
              $('#avatar-options').show();
            } else {
              $('#avatar-options').hide();
            }
        })
        $("#fixAvatars")[0].checked = items.fixAvatars;
        $("#fixAvatars").change();
        $("#squareAvatars")[0].checked = items.squareAvatars;
        $("#avatarWidth").val(items.avatarWidth);
        $("#avatarHeight").val(items.avatarHeight);
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
