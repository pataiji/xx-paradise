'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const form  = document.getElementById('configForm');

  Config.read().then(function(config) {
    document.getElementById('activeDomainRegexp').value   = config.activeDomainRegexp;
    document.getElementById('activeSrcRegexp').value      = config.activeSrcRegexp;
    document.getElementById('customEndpointDomain').value = config.customEndpointDomain;
    document.getElementById('mode').value = config.mode;
    document.getElementById('status').value = config.status;
  });

  form.addEventListener('click', function(e) {
    document.getElementById('msgSave').style.display = 'none';
    document.getElementById('msgClearCache').style.display = 'none';
    if (e.target.nodeName === 'INPUT' && e.target.getAttribute('type') === 'submit') {
      e.preventDefault();
      e.stopPropagation();

      if (e.target.value === 'Save') {
        Config.saveAll({
          activeDomainRegexp: document.getElementById('activeDomainRegexp').value,
          activeSrcRegexp: document.getElementById('activeSrcRegexp').value,
          customEndpointDomain: document.getElementById('customEndpointDomain').value,
          mode: document.getElementById('mode').value,
          status: document.getElementById('status').value
        }).then(() => {
          document.getElementById('msgSave').style.display = 'block';
        });
      } else if (e.target.value === 'Clear Cache') {
        Config.save('salt', null).then(() => {
          document.getElementById('msgClearCache').style.display = 'block';
        });
      }
    }
  });
});
