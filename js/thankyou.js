app.init = () => {
  if (id) {
    app.get.id("orderNumber").textContent = id;
  } else {
    window.location.replace("./");
  }
};

window.addEventListener("DOMContentLoaded", app.init);
