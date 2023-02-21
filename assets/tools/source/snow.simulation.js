/**
 * Author: Roger Lee
 * Site: https://roger.zone
 * Email: rijie.li@outlook.com
 * Christie Wang's aritcle helps a lot
 * Link: https://designers.hubspot.com/blog/how-to-implement-an-animated-snow-effect-using-html5-canvas-and-javascript
 */

let snowSimulation = (function (window, document) {
  let snowCanvas = document.getElementById("snow");
  let snowCanvasContext = snowCanvas.getContext("2d");

  let snowSpeed = 100;
  const SnowSpeedUnit = 1;
  const SnowFrameInterval = 33;

  let snowFlakeNumber = 200;
  let snowFlakeMaxRadius = 5;

  let particles = [];
  let dirctionAngle = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;

  window.addEventListener("resize", (e) => {
    intializeCanvas();
  });

  function intializeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    snowCanvas.height = canvasHeight;
    snowCanvas.width = canvasWidth;
    snowCanvasContext = snowCanvas.getContext("2d");
    snowCanvasContext.fillStyle = "rgba(255, 255, 255, 0.8)";

    dirctionAngle = 0;
    particles = [];

    for (var i = 0; i < snowFlakeNumber; i++) {
      particles.push({
        x: Math.random() * canvasWidth, //x-coordinate
        y: Math.random() * canvasHeight, //y-coordinate
        r: Math.random(), //radius prameters ratio
        d: Math.random() * snowFlakeNumber, //density
      });
    }
  }

  // TODO: Use alpha value to create Parallax effect
  // Draw frame and update next one
  function draw() {
    snowCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    snowCanvasContext.beginPath();
    for (var i = 0; i < snowFlakeNumber; i++) {
      var particle = particles[i];
      snowCanvasContext.moveTo(particle.x, particle.y);
      snowCanvasContext.arc(
        particle.x,
        particle.y,
        particle.r * snowFlakeMaxRadius + 1,
        0,
        Math.PI * 2,
        true
      );
    }
    snowCanvasContext.fill();
    computeNextFrame();
  }

  //Function to move the snowflakes
  //angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
  function computeNextFrame() {
    for (var i = 0; i < snowFlakeNumber; i++) {
      var particle = particles[i];
      //Updating X and Y coordinates
      //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
      //Every particle has its own density which can be used to make the downward movement different for each flake
      //Lets make it more random by adding in the radius
      particle.y +=
        Math.cos(dirctionAngle + particle.d) +
        SnowSpeedUnit * (snowSpeed / 100) +
        particle.r / 2;
      particle.x += Math.sin(dirctionAngle) * 2;

      //Sending flakes back from the top when it exits
      //Lets make it a bit more organic and let flakes enter from the left and right also.
      if (
        particle.x > canvasWidth + 5 ||
        particle.x < -5 ||
        particle.y > canvasHeight
      ) {
        if (i % 3 > 0) {
          //66.67% of the flakes
          particles[i] = {
            x: Math.random() * canvasWidth,
            y: -10,
            r: particle.r,
            d: particle.d,
          };
        } else {
          //If the flake is exitting from the right
          if (Math.sin(dirctionAngle) > 0) {
            //Enter from the left
            particles[i] = {
              x: -5,
              y: Math.random() * canvasHeight,
              r: particle.r,
              d: particle.d,
            };
          } else {
            //Enter from the right
            particles[i] = {
              x: canvasWidth + 5,
              y: Math.random() * canvasHeight,
              r: particle.r,
              d: particle.d,
            };
          }
        }
      }
    }
    dirctionAngle += 0.01;
  }

  function start() {
    intializeCanvas();
    draw();
    setInterval(draw, SnowFrameInterval);
  }

  window.addEventListener("load", function () {
    start();
  });

  /* ============== Configure Slider ============== */
  let sliderSpeed = document.getElementById("snowSpeedSlider");
  let sliderSize = document.getElementById("snowFlakeSizeSlider");
  let controlElement = document.getElementById("control")

  sliderSpeed.addEventListener("input", (e) => {
    snowSpeed = e.target.value;
  });

  sliderSize.addEventListener("input", (e) => {
    snowFlakeMaxRadius = e.target.value;
  });

  /* ============== Configure Tips ============== */
  let tipsElement = document.getElementById("tips")
  let tipsButton = document.getElementById("tips-button")

  const TipsStatusKey = "tips-button-clicked"

  window.addEventListener("load", e => {
    let tipsButtonClicked = localStorage.getItem(TipsStatusKey)
    if(tipsButtonClicked != 1) {
      tipsElement.style.visibility = "visible"
      controlElement.style.opacity = 1;
    }
  })

  tipsButton.addEventListener("click", e => {
    localStorage.setItem(TipsStatusKey, 1);
    tipsElement.style.visibility = "hidden"
    controlElement.style.removeProperty("opacity");
  })

})(window, document);
