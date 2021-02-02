//get URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const tag = urlParams.get("tag");
const searchInput = urlParams.get("search");
const id = urlParams.get("id");

//api
const hostName = "api.appworks-school.tw";
const apiVersion = "1.0";
const src = {
  all: `https://${hostName}/api/${apiVersion}/products/all`,
  women: `https://${hostName}/api/${apiVersion}/products/women`,
  men: `https://${hostName}/api/${apiVersion}/products/men`,
  accessories: `https://${hostName}/api/${apiVersion}/products/accessories`,
  search: `https://${hostName}/api/${apiVersion}/products/search?keyword=${searchInput}`,
  campaigns: `https://${hostName}/api/${apiVersion}/marketing/campaigns`,
  details: `https://${hostName}/api/${apiVersion}/products/details?id=${id}`,
  order: `https://${hostName}/api/${apiVersion}/order/checkout`,
  signIn: `https://${hostName}/api/${apiVersion}/user/signin`,
};

var app = {
  fbId: "fbssls_370457877417421",
  fbInfo: {},
  resObj: {},
  keyVisObj: {},
  step: 0, //key picture tracker
  cart: {
    list: [],
    freight: 60,
    subtotal: 0,
    total: 0,
  },
};

app.get = {
  id: (queryname) => {
    return document.getElementById(`${queryname}`);
  },
  all: (queryname) => {
    return document.querySelectorAll(`${queryname}`);
  },
};

//create element
app.createElement = (tag, atr, queryname, content) => {
  let newTag = document.createElement(`${tag}`);
  newTag[atr] = `${queryname}`;
  let newContent = document.createTextNode(content);
  newTag.appendChild(newContent);
  return newTag;
};

//get api
app.ajax = (src, callback) => {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(xhr.responseText);
  };
  xhr.open("GET", src);
  xhr.send();
};

//render
app.render = (id, content) => {
  let target = document.getElementById(id);
  target.appendChild(content);
};

//get local storage
app.getStorage = (key) => {
  if (window.localStorage.getItem(key)) {
    app.cart = JSON.parse(window.localStorage.getItem(key));
    app.updateCartIcon(app.cart.list.length);
  }
};

//set local storage
app.setStorage = (key, cart) => {
  window.localStorage.setItem(key, `${JSON.stringify(cart)}`);
};

//update number display on cart-icon
app.updateCartIcon = (num) => {
  let menuQty = document.querySelectorAll(".menu-cart-qty");
  menuQty.forEach((item) => {
    item.textContent = num;
    if (num !== 0) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
};

app.startLoadingGif = (isLoading) => {
  let loading = app.createElement("div", "className", "loading", "");
  isLoading
    ? document.body.appendChild(loading)
    : document.querySelector(".loading").remove();
};

app.showCurrentPageTag = () => {
  let currentTags = app.get.all(`[href="./?tag=${tag}"]`);
  currentTags.forEach((tag) => {
    tag.classList.toggle("currentPage");
  });
};
