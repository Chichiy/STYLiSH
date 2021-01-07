//create product
app.insertItems = (data) => {
  app.get.id("img").src = data.main_image;
  app.get.id("title").textContent = data.title;
  app.get.id("id").textContent = data.id;
  app.get.id("price").textContent += data.price;
  app.get.id("story").textContent = data.story;

  let colors = app.get.id("colors");
  for (let i = 0; i < data.colors.length; i++) {
    let code = data.colors[i].code;
    let color = app.createElement("div", "className", "color", "");
    color.id = `#${code}`;
    color.style.backgroundColor = `#${code}`;
    colors.appendChild(color);
  }

  let sizes = app.get.id("sizes");
  for (let i = 0; i < data.sizes.length; i++) {
    let size = app.createElement(
      "div",
      "className",
      "size",
      `${data.sizes[i]}`
    );
    size.id = data.sizes[i];
    sizes.appendChild(size);
  }

  let summary = app.get.id("summary");
  summary.innerHTML = `${data.note} <br >
                        <br >
                        ${data.texture}<br >
                        ${data.description.replace(/\r\n|\n|\r/gm, "<br>")}<br >
                        <br >
                        清洗：${data.wash}<br >
                        產地：${data.place}`;

  let description = app.get.id("description");
  for (let i = 0; i < 2; i++) {
    //only take first 2 images
    let img = app.createElement("img", "src", `${data.images[i]}`, "");
    img.alt = "產品展示圖片";
    description.appendChild(img);
  }
};

app.variant = (data) => {
  let colorList = document.querySelectorAll(".color");
  let sizeList = document.querySelectorAll(".size");
  let selectedCodeIndex;
  let selectedCode = colorList[0].id; //string: "#xxxxxx"
  let selectedstocks = data.variants.filter(
    //array of info of selected color
    (obj) => selectedCode === `#${obj.color_code}`
  );
  let firstInStock = selectedstocks.find((item) => item.stock > 0); //index(refer to differnet size)
  let selectedSizeIndex; //index(0: S, 1:M, 2:L)
  let add = app.get.id("add");
  let minus = app.get.id("minus");
  let value = app.get.id("value");
  let valueNum = Number(value.textContent); //number

  renderColorInfo(colorList[0], 0); //auto click on fisrt color to update stock info

  //click on colors
  colorList.forEach((color, index) => {
    color.onclick = () => {
      renderColorInfo(color, index);
    };
  });

  //click on size
  sizeList.forEach((size, index) => {
    size.onclick = () => {
      renderSizeInfo(index);
    };
  });

  function renderColorInfo(onclickColor, onclickIndex) {
    //reset all to default class
    colorList.forEach((color) => {
      color.className = "color";
    });
    onclickColor.className = "color current"; //add current

    //reset selected info
    selectedCodeIndex = onclickIndex;
    selectedCode = onclickColor.id;
    selectedstocks = data.variants.filter(
      (obj) => selectedCode === `#${obj.color_code}`
    );
    firstInStock = selectedstocks.findIndex((item) => item.stock > 0); //first in-stock index

    renderSizeInfo(firstInStock);
  }

  function renderSizeInfo(renderIndex) {
    //disable click on out-of-stock size
    if (selectedstocks[renderIndex].stock !== 0) {
      //reset all to default class
      sizeList.forEach((size, index) => {
        size.className = "size";
        if (selectedstocks[index].stock == 0) {
          size.className = "size disable";
        }
        if (index == renderIndex) {
          size.className = "size current"; //show onclick size
          selectedSizeIndex = index;
        }
        valueNum = 1; //reset value
        value.textContent = 1; //reset value display
      });
    }
  }
  //track value
  add.onclick = () => {
    if (valueNum < selectedstocks[selectedSizeIndex].stock) {
      valueNum += 1;
      value.textContent = valueNum;
    }
  };
  minus.onclick = () => {
    if (valueNum > 1) {
      valueNum -= 1;
      value.textContent = valueNum;
    }
  };

  //set local storage with chosen item
  let addCart = app.get.id("add-Cart");
  addCart.onclick = () => {
    app.addStorage(
      data,
      selectedCodeIndex,
      selectedstocks,
      selectedSizeIndex,
      valueNum
    );
    app.updateCartIcon(app.cart.list.length);
    window.alert("已加入購物車");
  };
};

//add loacl storage
app.addStorage = (
  data,
  selectedCodeIndex,
  selectedstocks,
  selectedSizeIndex,
  valueNum
) => {
  //update app.cart
  // app.addCheckOutInfo("delivery", "credit_card", recipient, 60); //set with default info
  app.addChekOutList(
    //set with selected product's info
    data,
    selectedCodeIndex,
    selectedstocks,
    selectedSizeIndex,
    valueNum
  );
  //update local storage
  app.setStorage("cart", app.cart);
};

app.addChekOutList = (
  data,
  selectedCodeIndex,
  selectedstocks,
  selectedSizeIndex,
  valueNum
) => {
  //check existance
  let isExist = app.cart.list.findIndex(
    (item) =>
      item.color.code === data.colors[selectedCodeIndex].code &&
      item.size === selectedstocks[selectedSizeIndex].size
  );

  if (isExist !== -1) {
    app.cart.list[isExist] = app.setListFormat(
      data,
      selectedCodeIndex,
      selectedstocks,
      selectedSizeIndex,
      valueNum
    );
  } else {
    app.cart.list.push(
      app.setListFormat(
        data,
        selectedCodeIndex,
        selectedstocks,
        selectedSizeIndex,
        valueNum
      )
    );
  }
  app.cart.subtotal = 0; //reset number
  app.cart.list.forEach((item) => {
    app.cart.subtotal += item.price * item.qty;
  });
  app.cart.total = app.cart.subtotal + app.cart.freight;
};

app.setListFormat = (
  data,
  selectedCodeIndex,
  selectedstocks,
  selectedSizeIndex,
  valueNum
) => {
  return {
    title: data.title,
    id: data.id,
    main_image: data.main_image,
    price: data.price,
    color: data.colors[selectedCodeIndex],
    size: selectedstocks[selectedSizeIndex].size,
    stock: selectedstocks[selectedSizeIndex].stock,
    qty: valueNum,
  };
};

app.renderProduct = (res) => {
  app.resObj = JSON.parse(res);
  let data = app.resObj.data;
  app.insertItems(data);
  app.variant(data);
};

app.init = () => {
  app.getStorage("cart"); //get local storage and update cart display
  app.ajax(src.details, (res) => app.renderProduct(res));
  console.log("All resources finished loading!");
};

window.addEventListener("DOMContentLoaded", app.init);
