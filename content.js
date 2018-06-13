"use strict";

class XxParadise {
  constructor(config) {
    this.config = config;
  }

  build() {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const imgs = document.getElementsByTagName("img");
        this.replaceImageUrls(imgs);
      },
      false
    );
    document.addEventListener(
      "DOMNodeInserted",
      e => {
        if (e.target instanceof HTMLElement) {
          const imgs = e.target.querySelectorAll("img");
          this.replaceImageUrls(imgs);
        }
      },
      false
    );
  }

  replaceImageUrls(imgs) {
    Array.prototype.forEach.call(imgs, img => {
      if (img.src.match(new RegExp(this.config.activeSrcRegexp))) {
        const width = img.width;
        const height = img.height;
        if (width > 0 && height > 0) {
          const fingerprint = this.getFingerprint(img.src);
          const imageUrl = this.buildImageUrl(width, height, fingerprint);
          img.src = "";
          img.src = imageUrl;
        }
      }
    });
  }

  buildImageUrl(width, height, fingerprint) {
    let parameter = width + "x" + height;
    if (this.config.mode === "aggressive_privacy")
      parameter += "-mode_aggressive_privacy";
    return (
      "//" + this.config.endpointDomain + "/" + parameter + "/" + fingerprint
    );
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
