// Saves options to chrome.storage
function save_options() {
  var idValues = document.getElementById('ids').value;

  chrome.storage.sync.set({
    ids: idValues
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    ids: '12345,6789',

  }, function(items) {
    document.getElementById('ids').value = items.ids;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
