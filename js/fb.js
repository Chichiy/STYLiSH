window.onload = fbInit;

function fbInit() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: "370457877417421",
      cookie: true,
      xfbml: true,
      version: "v8.0",
    });

    FB.getLoginStatus(function (response) {
      statusChangeCallback(response);
    });

    FB.AppEvents.logPageView();
  };

  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
}

function statusChangeCallback(res) {
  //get data from session storage
  app.fbInfo = res;

  //enable member btn
  let memberBtns = document.querySelectorAll(".member");
  memberBtns.forEach((btn) => {
    btn.onclick = () => {
      //if logged-in, re-direct to profile page
      if (res.status === "connected") {
        console.log("Already signed in");
        window.location = "./profile.html";
      } else {
        //if not logged-in, ask to log-in with FB then re-direct to profile page
        FB.login((res) => afterLogin(res), {
          scope: "public_profile,email,",
        });
      }
    };
  });
}

function afterLogin(res) {
  if (res.authResponse) {
    window.location = "./profile.html";
  } else {
    console.log("User cancelled login or did not fully authorize.");
  }
}
