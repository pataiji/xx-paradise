'use strict';

class Config {
  static get DEFAULT_CONFIG() {
    return {
      activeDomainRegexp: '.*',
      activeSrcRegexp: '.*',
      customEndpointDomain: null,
      endpointDomain: 'xx-paradise.pataiji.com',
      mode: 'default',
      status: 'enabled'
    };
  }

  static read() {
    return new Promise((resolve) => {
      const config = this.DEFAULT_CONFIG;
      chrome.storage.local.get('config', (saved) => {
        if (saved.config) {
          if (saved.config.activeDomainRegexp)
            config.activeDomainRegexp = saved.config.activeDomainRegexp;
          if (saved.config.activeSrcRegexp)
            config.activeSrcRegexp = saved.config.activeSrcRegexp;
          if (saved.config.customEndpointDomain)
            config.endpointDomain = saved.config.customEndpointDomain;
            config.customEndpointDomain = saved.config.customEndpointDomain;
          if (saved.config.salt)
            config.salt = saved.config.salt;
          else {
            config.salt = this.randomString(64);
            this.save(config);
          }
          if (saved.config.mode)
            config.mode = saved.config.mode;
          if (saved.config.status)
            config.status = saved.config.status;
        }
        resolve(config);
      });
    });
  }

  static saveAll(config) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ config: config }, () => {
        resolve(config);
      });
    });
  }

  static save(key, value) {
    return new Promise((resolve) => {
      this.read().then((config) => {
        config[key] = value;
        this.saveAll(config).then(() => {
          resolve(config);
        });
      });
    });
  }

  static randomString(length) {
    const seeds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const sLength = seeds.length;
    let str = '';
    for(var i = 0; i < length; i++){
      str += seeds[Math.floor(Math.random() * sLength)];
    }
    return str;
  }
}

window.Config = Config;
