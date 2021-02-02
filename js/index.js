//create product list
app.createProducts = () => {
  let content = app.createElement("div", "className", "products", "");
  let product;
  for (let i = 0; i < app.resObj.data.length; i++) {
    product = app.createProduct(i);
    content.appendChild(product);
  }
  return content;
};

app.createProduct = (index) => {
  let content = app.createElement("a", "className", "product", "");
  content.href = `./product.html?id=${app.resObj.data[index].id}`;
  let productPhoto = app.createElement("div", "className", "product-photo", "");
  let img = app.createElement("img", "", "", "");
  img.src = app.resObj.data[index].main_image;
  img.loading = "lazy";
  img.alt = "產品縮圖";
  productPhoto.appendChild(img);
  let colors = app.createElement("div", "className", "colors", "");
  for (let i = 0; i < app.resObj.data[index].colors.length; i++) {
    let code = app.resObj.data[index].colors[i].code;
    let color = app.createElement("div", "className", "color", "");
    color.style.backgroundColor = `#${code}`;
    colors.appendChild(color);
  }
  let title = app.createElement(
    "div",
    "className",
    "product-info",
    app.resObj.data[index].title
  );
  let price = app.createElement(
    "div",
    "className",
    "product-info",
    `NTD.${app.resObj.data[index].price}`
  );

  content.appendChild(productPhoto);
  content.appendChild(colors);
  content.appendChild(title);
  content.appendChild(price);

  return content;
};

// infinite scroll
app.addProducts = () => {
  if (app.resObj.next_paging) {
    if (src[tag]) {
      app.ajax(`${src[tag]}?paging=${app.resObj.next_paging}`, (res) =>
        app.renderProductList(res)
      );
    } else {
      app.ajax(`${src.all}?paging=${app.resObj.next_paging}`, (res) =>
        app.renderProductList(res)
      );
    }
  }
};

window.addEventListener("scroll", function () {
  let rect = document.body.getBoundingClientRect();
  let y = rect.bottom - window.innerHeight;
  // show distance between bottom
  if (y < 1 && y >= 0) {
    app.addProducts();
  }
});

// render product list
app.renderProductList = (res) => {
  app.resObj = JSON.parse(res);
  if (app.resObj.data.length == 0) {
    document.getElementById("root").innerHTML = "<span>查無相關商品</span>";
  } else {
    let content = app.createProducts();
    app.render("root", content);
  }
};

app.init = () => {
  app.getStorage("cart"); //get local storage and update cart display
  if (searchInput) {
    app.ajax(src.search, (res) => app.renderProductList(res));
  } else if (tag) {
    app.ajax(src[tag], (res) => app.renderProductList(res));
    app.showCurrentPageTag();
  } else {
    app.ajax(src.all, (res) => app.renderProductList(res));
  }
};

window.addEventListener("DOMContentLoaded", app.init);
