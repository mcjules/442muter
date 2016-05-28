// Saves options to chrome.storage
function save_options() {
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
var records = null;

function restore_options() {
    chrome.storage.sync.get({
        ids: '',
        users: []
    }, function(items) {
        records = items;

        for (var i = 0; i < items.users.length; i++) {
            $('#userBody').append($('<tr>').append($('<td>').text(items.users[i].username)).append($('<td>').text(items.users[i].userId)).append($('<td>').html("<a class='removeLink' href='javascript:void 0' index='" + i + "'>Remove</a>")));
        }
        $('.removeLink').click(removeUser);
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
