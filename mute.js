chrome.storage.sync.get({
  ids: '12345,6789',

}, function(items) {
  posterIds = items.ids.split(',');
  mutePosts(posterIds);
});


function mutePosts(posterIds){
var tableRows = $('table[class="content"][cellspacing="1"]').children('tbody').children('tr');

var blockedPost = false;
for(i =0; i< tableRows.length; i++) {
  if(blockedPost) {
    $($(tableRows[i]).children()[0]).html('');
    $($(tableRows[i]).children()[1]).html('');
    blockedPost = false;
  }
  if($(tableRows[i]).attr('class') == 'postheader') {
    for (j =0; j< posterIds.length; j++) {
      var poster = $(tableRows[i]).find('[href="/forums/default.aspx?g=profile&u='+posterIds[j]+'"]');
      if (poster.length > 0) {
        poster.parent().html("Muted");
        $($(tableRows[i]).children()[1]).html('');
        blockedPost = true;
      }
    }
  }
}
}
