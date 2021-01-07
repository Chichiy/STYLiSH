function fbInit() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: "370457877417421",
      autoLogAppEvents: true,
      xfbml: true,
      version: "v8.0",
    });

    FB.getLoginStatus(function (response) {
      statusChangeCallback(response);
    });
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
  if (res.status === "connected") {
    app.fbInfo = res;
    console.log("Already signed in");
    signIn(app.fbInfo.authResponse.accessToken, (res) => renderProfile(res));
  } else {
    FB.login((res) => afterLogin(res), {
      scope: "public_profile,email,",
    });
  }
}

function afterLogin(res) {
  if (res.authResponse) {
    app.fbInfo = res;
    signIn(app.fbInfo.authResponse.accessToken, (res) => renderProfile(res));
  } else {
    alert("User cancelled login or did not fully authorize.");
    window.location = "./";
  }
}

function renderProfile(res) {
  app.print(res);
  app.get.id("userImg").src = res.picture;
  app.get.id("userImg").classList.toggle("hidden");
  app.get.id("name").innerHTML += res.name;
  app.get.id("email").innerHTML += res.email;

  // FB.api(
  //   "/me",
  //   "GET",
  //   { fields: "email,name,picture.width(200).height(200)" },
  //   function (res) {
  //     app.get("id", "userImg").src = res.picture.data.url;
  //     app.get("id", "name").innerHTML += res.name;
  //     app.get("id", "email").innerHTML += res.email;
  //   }
  // );

  //enable sign out btn
  app.get.id("logOut").onclick = () => {
    FB.logout(function () {
      window.location.replace("./");
    });
  };
}

function signIn(accessToken, callback) {
  let signIn = { provider: "facebook", access_token: `${accessToken}` };
  var xhr = new XMLHttpRequest();
  xhr.open("POST", src.signIn, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(signIn));
  xhr.onload = function () {
    callback(JSON.parse(xhr.responseText).data.user);
  };
}

window.addEventListener("DOMContentLoaded", fbInit);
