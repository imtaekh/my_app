$(function(){
  $(".checkValidation").on("submit",function(e){
    var cvForm = $(this);
    var isValid = true;
    cvForm.find(".cvRequired").each(function(){
      var cvRequired = $(this);
      var cvRqErrMsg = cvRequired.attr("cvRqErrMsg");
      var cvRqErrTo = $(cvRequired.attr("cvRqErrTo"));
      if(cvRequired.val() === ""){
        isValid = false;
        cvRqErrTo.text(cvRqErrMsg);
      } else {
        cvRqErrTo.text("");
      }
    });

    cvForm.find("input.cvMatch").each(function(){
      var cvMatch = $(this);
      if(cvMatch.val() !== ""){
        var cvMatW = $(cvMatch.attr("cvMatW"));
        var cvMatErrMsg = cvMatch.attr("cvMatErrMsg");
        var cvMatErrTo = $(cvMatch.attr("cvMatErrTo"));
        if(cvMatch.val() !== cvMatW.val()){
          isValid = false;
          cvMatErrTo.text(cvMatErrMsg);
        } else {
          cvMatErrTo.text("");
        }
      }
    });

    cvForm.find("input.cvMinLength").each(function(){
      var cvMinLength = $(this);
      var minLength = cvMinLength.attr("cvMinLength");
      var cvMinLenErrMsg = cvMinLength.attr("cvMinLenErrMsg");
      var cvMinLenErrTo = $(cvMinLength.attr("cvMinLenErrTo"));
      if(cvMinLength.val().length < minLength){
        isValid = false;
        cvMinLenErrTo.text(cvMinLenErrMsg);
      } else {
        cvMinLenErrTo.text("");
      }
    });

    if(!isValid){
      if(e.preventDefault) e.preventDefault();
      else return false;
    }
  });
});
