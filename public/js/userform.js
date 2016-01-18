//console.log("userform.js");
if(document.querySelector("#create_user")){
  document.querySelector("#create_user input[type='button']").onclick = function(e){
    var isValid = true;
    document.querySelector("#email_error").innerText = "";
    document.querySelector("#nickname_error").innerText = "";
    document.querySelector("#password_error").innerText = "";
    if(document.querySelector("#email").value === ""){
      isValid = false;
      document.querySelector("#email_error").innerText = "- Email is required.";
    }
    if(document.querySelector("#nickname").value === ""){
      isValid = false;
      document.querySelector("#nickname_error").innerText = "- Nickname is required.";
    }
    if(document.querySelector("#password").value === ""){
      isValid = false;
      document.querySelector("#password_error").innerText = "- Password is required.";
    }
    if(document.querySelector("#password").value !== document.querySelector("#password_confirmation").value){
      isValid = false;
      document.querySelector("#password_confirmation_error").innerText = "- Confirmation doesn't match with Password.";
    }
    if(isValid){
      document.querySelector("#create_user").submit();
    }
  };
}
if(document.querySelector("#update_user")){
  document.querySelector("#update_user input[type='button']").onclick = function(e){
    var isValid = true;
    document.querySelector("#email_error").innerText = "";
    document.querySelector("#nickname_error").innerText = "";
    document.querySelector("#password_error").innerText = "";
    if(document.querySelector("#email").value === ""){
      isValid = false;
      document.querySelector("#email_error").innerText = "- Email is required.";
    }
    if(document.querySelector("#nickname").value === ""){
      isValid = false;
      document.querySelector("#nickname_error").innerText = "- Nickname is required.";
    }
    if(document.querySelector("#password").value === ""){
      isValid = false;
      document.querySelector("#password_error").innerText = "- Password is required.";
    }
    if(document.querySelector("#new_password").value !== document.querySelector("#password_confirmation").value){
      isValid = false;
      document.querySelector("#password_confirmation_error").innerText = "- Confirmation doesn't match with New Password.";
    }
    if(isValid){
      document.querySelector("#update_user").submit();
    }
  };
}
