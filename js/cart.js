app.renderCart = () => {
  let checkoutBtn = app.get.id("checkoutBtn");
  let isCartempty = app.cart.list.length === 0;

  if (isCartempty) {
    app.get.id("list").textContent = "購物車中沒有任何商品";
    insertCheckoutInfo(app.cart);
  } else {
    insertProductList(app.cart);
    insertCheckoutInfo(app.cart);
    handleQtyChange(app.cart); //handle changes on product number
    handleProductRemoval(app.cart); //handle removals on product number
  }
  checkoutBtnswitch(isCartempty);

  function insertProductList(data) {
    let list = app.get.id("list");
    let product;
    data.list.forEach((item) => {
      product = createListItem(item);
      list.appendChild(product);
    });

    function createListItem(item) {
      let content = app.createElement("div", "className", "row", "");
      let product = {
        productInfo: createProductInfo(),
        qty: createQty(),
        price: app.createElement(
          "div",
          "className",
          "price",
          `NT. ${item.price}`
        ),
        subtotal: app.createElement(
          "div",
          "className",
          "subtotal",
          `NT. ${item.price * item.qty}`
        ),
        remove: app.createElement("div", "className", "remove", ""),
      };

      for (let each in product) {
        content.appendChild(product[each]);
      }

      return content;

      function createProductInfo() {
        let info = app.createElement("div", "className", "product-Info", "");
        let mainImage = app.createElement("div", "className", "main-Image", "");
        mainImage.innerHTML = `<img src = "${item.main_image}" alt="產品圖片">`;
        let details = app.createElement("div", "className", "details", "");
        details.innerHTML = `
      <span>
      ${item.title}<br>
      ${item.id}<br>
      <br>
      顏色：${item.color.name}<br>
      尺寸：${item.size}
      </span>`;

        info.appendChild(mainImage);
        info.appendChild(details);
        return info;
      }
      function createQty() {
        let qty = app.createElement("div", "className", "qty", "");
        let qtySelect = app.createElement("select", "", "", "");
        for (let i = 1; i < item.stock + 1; i++) {
          let num = app.createElement("option", "value", i, i);
          qtySelect.appendChild(num);
          qtySelect.value = item.qty;
        }
        qty.appendChild(qtySelect);
        return qty;
      }
    }
  }

  function insertCheckoutInfo(data) {
    app.get.id("subtotal").textContent = data.subtotal;
    app.get.id("freight").textContent = data.freight;
    app.get.id("total").textContent = data.total;
  }

  function checkoutBtnswitch(isCartempty) {
    if (isCartempty) {
      //disable checkoutBtn
      checkoutBtn.className += " checkout-Btn-Disable";
      checkoutBtn.setAttribute("disabled", true);
    } else {
      //enable checkoutBtn
      checkoutBtn.removeAttribute("disabled");
      checkoutBtn.className = "checkout-Btn";
    }
  }

  function handleQtyChange(data) {
    let qty = app.get.all(".qty");

    for (let i = 1; i < qty.length; i++) {
      //the [0] one sever as the title
      qty[i].childNodes[1].onchange = () => {
        //change data: app.cart.list.qty = changed number
        data.list[i - 1].qty = Number(qty[i].childNodes[1].value);
        recountCart(data);

        //re-render: change subtotal's display
        qty[i].nextSibling.nextSibling.textContent = `NT. ${
          data.list[i - 1].qty * data.list[i - 1].price
        }`;
        insertCheckoutInfo(data);
      };
    }
  }

  function recountCart(data) {
    //recount total numbers
    data.subtotal = 0;
    data.list.forEach((item) => {
      data.subtotal += item.price * item.qty;
    });
    data.total = data.subtotal + data.freight;

    //reset localstorage
    app.setStorage("cart", data);
    app.getStorage("cart");
  }

  function handleProductRemoval(data) {
    let removes = app.get.all(".remove");
    removes.forEach((remove, index) => {
      remove.onclick = () => {
        //change data
        data.list.splice(index, 1);
        recountCart(data);
        window.alert("已從購物車中移除");

        //re-render
        let list = app.get.id("list");
        Array.from(list.childNodes).forEach((item) => {
          item.remove();
        });
        app.renderCart();
      };
    });
  }
};

app.enableCheckOut = () => {
  installTapPay(); //install tap pay
  let checkoutBtn = app.get.id("checkoutBtn");
  checkoutBtn.onclick = (e) => checkoutBtnOnclickHandler(e);

  function checkoutBtnOnclickHandler(event) {
    event.preventDefault();
    let recipientInputs = [
      { category: "收件人姓名", value: app.get.id("name").value },
      {
        category: "電子信箱",
        value: app.get.id("email").value,
        rule: /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
      },
      {
        category: "手機號碼",
        value: app.get.id("cellphone").value,
        rule: /^09[0-9]{8}$/,
      },
      { category: "收件地址", value: app.get.id("address").value },
    ];

    //check first recipient then payment inputs' status
    let isInputsReady = checkRecipientInfo() ? checkPaymentInfo() : false;
    if (isInputsReady) {
      TPDirect.card.getPrime((res) => {
        if (res.status !== 0) {
          alert("get prime error " + res.msg);
          return;
        }

        let data = getCheckoutData(res.card.prime);
        sendToCheckoutApi(data, (orderNumber) => goToThankyouPage(orderNumber));
      });
    }
    function checkRecipientInfo() {
      for (let input of recipientInputs) {
        if (input.value) {
          if (input.rule && checkRule(input.rule, input.value)) {
            alert(`${input.category}格式有誤`);
            return false;
          }
        } else {
          alert(`請填入${input.category}`);
          return false;
        }
      }
      return true;

      function checkRule(ruleType, input) {
        return !ruleType.exec(String(input));
      }
    }
    function checkPaymentInfo() {
      const tappayStatus = TPDirect.card.getTappayFieldsStatus();
      let inputs = [
        { category: "信用卡號碼", status: tappayStatus.status.number },
        { category: "信用卡有效期限", status: tappayStatus.status.expiry },
        { category: "信用卡安全碼", status: tappayStatus.status.ccv },
      ];

      for (let input of inputs) {
        if (input.status == 2) {
          alert(`${input.category}輸入錯誤`);
          return false;
        } else if (input.status == 1) {
          alert(`請填入${input.category}`);
          return false;
        }
      }
      return true;
    }
    function getCheckoutData(prime) {
      let data = {
        prime: prime,
        order: {
          shipping: app.get.id("country").value,
          payment: app.get.id("payment").value,
          subtotal: app.cart.subtotal,
          freight: app.cart.freight,
          total: app.cart.total,
          recipient: {
            name: recipientInputs[0].value,
            phone: recipientInputs[1].value,
            email: recipientInputs[2].value,
            address: recipientInputs[3].value,
            time: document.querySelector("[name=time]:checked").value,
          },
          list: [],
        },
      };

      app.cart.list.forEach((item) => {
        data.order.list.push({
          id: String(item.id),
          name: item.title,
          price: item.price,
          color: item.color,
          size: item.size,
          qty: item.qty,
        });
      });
      return data;
    }
    function sendToCheckoutApi(data, callback) {
      app.startLoadingGif(true);
      let isFbLogin = app.fbInfo.length;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", src.order, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      if (isFbLogin)
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${app.fbInfo.authResponse.accessToken}`
        );

      xhr.send(JSON.stringify(data));
      xhr.onload = function () {
        callback(JSON.parse(xhr.responseText).data.number);
      };
    }
    function goToThankyouPage(orderNumber) {
      window.localStorage.removeItem("cart");
      window.location.replace(`./thankyou.html?id=${orderNumber}`);
    }
  }

  function installTapPay() {
    TPDirect.setupSDK(
      12348,
      "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
      "sandbox"
    );

    TPDirect.card.setup({
      fields: {
        number: {
          element: "#card-number",
          placeholder: "**** **** **** ****",
        },
        expirationDate: {
          element: document.getElementById("card-expiration-date"),
          placeholder: "MM / YY",
        },
        ccv: {
          element: "#card-ccv",
          placeholder: "CCV",
        },
      },
      styles: {
        input: {
          color: "#3f3a3a",
        },
        ".valid": {
          color: "green",
        },
        ".invalid": {
          color: "red",
        },
      },
    });
  }
};

app.init = () => {
  app.getStorage("cart");
  app.renderCart();
  app.enableCheckOut();
};

window.addEventListener("DOMContentLoaded", app.init);
