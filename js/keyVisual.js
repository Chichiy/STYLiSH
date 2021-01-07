//render keyvisual and effect
app.enableKeyVisual = () => {
  app.ajax(src.campaigns, (res) => renderKeyVisual(res));

  function renderKeyVisual(res) {
    let keyVisObj = JSON.parse(res);
    createKeyVisual();
    enableSlideEffect();

    function createKeyVisual() {
      let content = new DocumentFragment();
      appendImgsInContent();
      appendCirclesInContent();
      app.render("keyVisual", content);

      function appendImgsInContent() {
        keyVisObj.data.forEach((data, i) => {
          let img = app.createElement("a", "className", "visualImg", "");
          img.style.backgroundImage = `url("${data.picture}")`;
          img.href = `./product.html?id=${data.product_id}`;
          if (i == 0) img.classList.toggle("current");
          let story = app.createElement("div", "className", "story", "");
          story.innerHTML = data.story.replace(/\r\n|\n|\r/gm, "<br>");
          img.appendChild(story);
          content.appendChild(img);
        });
      }
      function appendCirclesInContent() {
        let circleContainer = app.createElement(
          "div",
          "className",
          "circleContainer",
          ""
        );
        keyVisObj.data.forEach((data, i) => {
          let circle = app.createElement("div", "className", "circle", "");
          if (i == 0) circle.classList.toggle("current");
          circleContainer.appendChild(circle);
        });
        content.appendChild(circleContainer);
      }
    }

    function enableSlideEffect() {
      let totalPic = keyVisObj.data.length;
      let visualImgs = document.querySelectorAll(".visualImg");
      let circles = document.querySelectorAll(".circle");

      //////////initial counter for slide effect//////////
      //track current element (about to hide)
      let now = 0;

      //track next element (about to show)
      let next = 1;

      //translate tracker to element's order
      let counter = {
        toHide: now % totalPic,
        toShow: next % totalPic,
      };

      //////////start slide effect//////////
      let intervalId = setInterval(slideEffect, 5000);
      handlePauseEffect();
      handleClickOnCircles();

      function slideEffect() {
        toggleCurrent(counter.toHide);
        toggleCurrent(counter.toShow);
        updateCounter();
      }

      function toggleCurrent(i) {
        visualImgs[i].classList.toggle("current");
        circles[i].classList.toggle("current");
      }

      function updateCounter() {
        now++;
        next++;
        counter = {
          toHide: now % totalPic,
          toShow: next % totalPic,
        };
      }

      //pause when mouseover both circles and visual imgs
      function handlePauseEffect() {
        let onPauseLists = [visualImgs, circles];
        onPauseLists.forEach((list) =>
          list.forEach((elem) => {
            elem.onmouseover = function () {
              clearInterval(intervalId);
            };
            elem.onmouseout = function () {
              intervalId = setInterval(slideEffect, 5000);
            };
          })
        );
      }

      function handleClickOnCircles() {
        circles.forEach((circle, i) => {
          circle.onclick = function () {
            //enable onclick only when element is not currently shown
            if (i !== counter.toHide) {
              counter.toShow = i;
              toggleCurrent(counter.toHide);
              toggleCurrent(counter.toShow);

              //retrack current and next element
              next = i;
              now = next - 1;
              updateCounter();
            }
          };
        });
      }
    }
  }
};

window.addEventListener("DOMContentLoaded", app.enableKeyVisual);
