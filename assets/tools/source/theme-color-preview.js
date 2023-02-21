/**
 * Author: Roger Lee
 * Site: https://roger.zone
 * Email: rijie.li@outlook.com
 */

let themeColorPreview = (function (window, document) {
  let colorPicker = new iro.ColorPicker("#color-picker", {
    width: 280,
    color: "#0066FF",
  });
  let codeGen1 = document.getElementById("code-gen-line1");
  let codeGen2 = document.getElementById("code-gen-line2");
  let colorInput = document.getElementById("color-input");

  let metaTag = document.querySelector("meta[name=theme-color]");

  colorPicker.on("color:change", function (color) {
    let colorString = colorPicker.color.hexString.toUpperCase();
    metaTag.content = colorString;
    document.getElementsByTagName("body")[0].style.backgroundColor =
      colorString;
    colorInput.value = colorString;

    codeGen1.value = `<meta name="theme-color" content="${colorString}">`;

    codeGen2.value = `<meta name="theme-color" content="${colorString}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${colorString}" media="(prefers-color-scheme: dark)">`;
  });

  colorInput.addEventListener("change", (e) => {
    colorPicker.color.hexString = colorInput.value;
  });

  let nsnotice = document.getElementById("not-safari-notice");
  if (nsnotice != null) {
    let isSafari =
      navigator.vendor &&
      navigator.vendor.indexOf("Apple") > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf("Chrome") == -1 &&
      navigator.userAgent.indexOf("CriOS") == -1 &&
      navigator.userAgent.indexOf("FxiOS") == -1;

    let anchorString = "Version/";
    let vIndex =
      navigator.userAgent.indexOf(anchorString) + anchorString.length;
    let versionString = navigator.userAgent.slice(vIndex, vIndex + 2);

    let versionNumber =
      versionString != "" &&
      parseInt(versionString) &&
      parseInt(versionString) >= 15;

    if (isSafari && versionNumber) {
      nsnotice.style.display = "none";
    }
  }
})(window, document);
