app.init = () => {
  if (id) {
    app.get.id("orderNumber").textContent = id;
    console.log("All resources finished loading!");
  } else {
    window.location.replace("./");
  }
};

window.addEventListener("DOMContentLoaded", app.init);
