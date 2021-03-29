/**
 * Reads manifest.json and determines the file to use
 */
(function () {
  const rootURI = document.currentScript.src.split('/loader.js')[0]
  
  // Load the manifest
  fetch(rootURI + '/manifest.json')
    .then(response => response.json())
    .then(manifest => {
      // Inject Handsfree
      const $script = document.createElement('script')
      const $link = document.createElement('link')

      $script.src = 'https://unpkg.com/handsfree@latest/build/lib/handsfree.js'
      $link.setAttribute('rel', 'stylesheet')
      $link.setAttribute('type', 'text/css')
      $link.setAttribute('href', 'https://unpkg.com/handsfree@latest/build/lib/assets/handsfree.css')

      /**
       * Configure Handsfree.js and load scripts
       */
      $script.onload = function () {
        handsfree = new Handsfree({
          showDebug: true,
          hands: true
        });
        handsfree.enablePlugins('browser')
    
        // Position fix the debugger
        handsfree.debug.$wrap.style.position = 'fixed'
        handsfree.debug.$wrap.style.width = '480px'
        handsfree.debug.$wrap.style.right = '0'
        handsfree.debug.$wrap.style.bottom = '0'
        handsfree.debug.$wrap.style.zIndex = '99999'
    
        // Loop through each site and look for matches
        // @todo Break once a match is found
        Object.keys(manifest.sites).forEach(n => {
          const site = manifest.sites[n]
          
          if (typeof site.matches === 'string') site.matches = [site.matches]
          if (typeof site.js === 'string') site.js = [site.js]
          if (typeof site.css === 'string') site.css = [site.css]
  
          // Inject scripts
          site.matches.forEach(match => {
            const regexp = new RegExp(match)
            if (regexp.test(window.location.href)) {
              // Inject JS
              site.js && site.js.forEach(script => {
                const $script = document.createElement('script')
                $script.src = rootURI + '/' + script
                document.body.appendChild($script)
              })
  
              // Inject CSS
              site.css && site.css.forEach(css => {
                const $link = document.createElement('link')
                $link.setAttribute('rel', 'stylesheet')
                $link.setAttribute('type', 'text/css')
                $link.setAttribute('href', rootURI + '/' + css)
                document.head.appendChild($link)
              })
            }
          })
        })

        handsfree.start()
      }

      document.body.appendChild($script)
      document.head.appendChild($link)
    })
})()