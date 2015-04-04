/*
 * Script tag fetch
 */
(function() {

  var head = document.getElementsByTagName('head')[0];

  // call this functione everytime a wrapper executes
  SystemJSLoader.prototype.onScriptLoad = function() {};

  // override fetch to use script injection
  hook('fetch', function(fetch) {
    return function(load) {
      var loader = this;
      return new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.async = true;

        function complete(evt) {
          if (s.readyState && s.readyState != 'loaded' && s.readyState != 'complete')
            return;
          cleanup();

          // this runs synchronously after execution
          // we now need to tell the wrapper handlers that
          // this load record has just executed
          loader.onScriptLoad(load);

          // if nothing registered, then something went wrong
          if (!load.metadata.registered)
            reject(load.address + ' did not call System.register or AMD define');

          resolve('');
        }

        function error(evt) {
          cleanup();
          reject(new Error('Unable to load script ' + load.address));
        }

        if (s.attachEvent) {
          s.attachEvent('onreadystatechange', complete);
        }
        else {
          s.addEventListener('load', complete, false);
          s.addEventListener('error', error, false);
        }

        s.src = load.address;
        head.appendChild(s);

        function cleanup() {
          if (s.detachEvent)
            s.detachEvent('onreadystatechange', complete);
          else {
            s.removeEventListener('load', complete, false);
            s.removeEventListener('error', error, false);
          }
          head.removeChild(s);
        }
      });
    };
  });
})();
