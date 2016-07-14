$(function(){

  $(".highlight").each(function(i,e){
    var highlightText = $(e).data().highlight;
    if(highlightText){
      var originalText = $(e).text();
      originalText = originalText.replace(new RegExp("<", "g"), "&lt;");
      originalText = originalText.replace(new RegExp(">", "g"), "&gt;");

      var newText = originalText;

      var matches = originalText.match(new RegExp(highlightText, "ig"));
      if(matches !== null){
        matches = distinct(matches);
        matches.forEach(function(match){
          newText = newText.replace(new RegExp(match, "g"), "<span class='searchHighligt'>"+match+"</span>");
        });
      }

      $(e).html(newText);
    }
  });

  function distinct(array){
    var returnArray = [];
    for(i=0;i<array.length;i++){
      if(array.indexOf(array[i]) == i)
      returnArray.push(array[i]);
    }
    return returnArray;
  }

});
