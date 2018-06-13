"use strict";

class XxParadise {
  constructor(config) {
    this.config = config;
  }

  build() {
    new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
          const imgs = mutation.target.getElementsByTagName("img");
          this.replaceImageSrcAll(imgs);
          const elements = e.target.getElementsByTagName("*");
          this.replaceBackgroundImageAll(elements);
        } else if (mutation.type == "attributes") {
          if (mutation.attributeName == "style") {
            this.replaceBackgroundImage(mutation.target);
          } else if (mutation.attributeName == "src") {
            this.replaceImageSrc(mutation.target);
          } else if (mutation.attributeName == "srcset") {
            this.replaceImageSrcset(mutation.target);
          }
        }
      }
    }).observe(document.querySelector("body"), {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style", "src", "srcset"]
    });

    const imgs = document.getElementsByTagName("img");
    this.replaceImageSrcAll(imgs);

    const elements = document.getElementsByTagName("*");
    this.replaceBackgroundImageAll(elements);
  }

  isReplacedImageUrl(imageUrl) {
    return imageUrl.match(new RegExp("https?://" + this.config.endpointDomain));
  }

  replaceImageSrcAll(imgs) {
    Array.prototype.forEach.call(imgs, img => {
      this.replaceImageSrc(img);
    });
  }

  replaceBackgroundImageAll(elms) {
    Array.prototype.forEach.call(elms, elm => {
      this.replaceBackgroundImage(elm);
    });
  }

  replaceImageSrc(img) {
    if (this.isReplacedImageUrl(img.src)) {
      return;
    }
    const [width, height] = this.getElementSize(img);
    if (width <= 0 || height <= 0) {
      return;
    }
    const imageUrl = this.buildImageUrl(img.src, width, height);
    if (imageUrl == img.src) return;
    img.src = "";
    img.src = imageUrl;
  }

  replaceImageSrcset(img) {
    if (this.isReplacedImageUrl(img.srcset)) {
      return;
    }
    const [width, height] = this.getElementSize(img);
    if (width <= 0 || height <= 0) {
      return;
    }
    const imageUrl = this.buildImageUrl(img.srcset, width, height);
    if (imageUrl == img.srcset) return;
    img.srcset = "";
    img.srcset = imageUrl;
  }

  replaceBackgroundImage(elm) {
    const backgroundImage = window.getComputedStyle(elm).backgroundImage;
    const match = backgroundImage.match(new RegExp('url\\("?(.*)"?\\)'));
    if (!match) {
      return;
    }
    if (this.isReplacedImageUrl(match[1])) {
      return;
    }
    const [width, height] = this.getElementSize(elm);
    if (width <= 0 || height <= 0) {
      return;
    }
    const imageUrl = this.buildImageUrl(match[1], width, height);
    elm.style.backgroundImage = "url(" + imageUrl + ")";
  }

  buildImageUrl(imageUrl, width, height) {
    if (!imageUrl.match(new RegExp(this.config.activeSrcRegexp))) {
      return imageUrl;
    }
    const fingerprint = this.getFingerprint(imageUrl);
    let parameter = width + "x" + height;
    if (this.config.mode === "aggressive_privacy")
      parameter += "-mode_aggressive_privacy";
    return (
      "//" + this.config.endpointDomain + "/" + parameter + "/" + fingerprint
    );
  }

  getElementSize(elm) {
    const style = window.getComputedStyle(elm);
    const width = Math.ceil(style.width.replace("px", ""));
    const height = Math.ceil(style.height.replace("px", ""));
    return [width, height];
  }

  getFingerprint(str) {
    str = str.replace(/[^abcdefghijklmnopqrstuvwxyz0123456789]/gi, "");
    const sLength = str.length;
    let fingerprint = "";
    for (var i = 0; i < 32; i++) {
      let t = str[i * 2];
      if (t) fingerprint += t;
      else break;
    }
    return fingerprint + this.config.salt;
  }
}

Config.read().then(config => {
  if (
    config.status === "enabled" &&
    document.domain.match(new RegExp(config.activeDomainRegexp))
  ) {
    new XxParadise(config).build();
  }
});

shortcut.add("Ctrl+Shift+s", () => {
  Config.read().then(config => {
    let mode = "";
    if (config.mode === "aggressive_privacy") {
      mode = "default";
    } else {
      mode = "aggressive_privacy";
    }
    Config.save("mode", mode).then(() => {
      location.reload();
    });
  });
});
