/**
 * Reads manifest.json and determines the file to use
 */
(function () {
  const rootURI = document.currentScript.src.split('/loader.js')[0]
  
  // Load the manifest
  fetch(rootURI + '/manifest.json')
    .then(response => response.json())
    .then(manifest => {
      const $ = {
        handsfree: {
          js: document.createElement('script'),
          css: document.createElement('link')
        },
        dashboard: {
          iframe: document.createElement('iframe'),
          css: document.createElement('link')
        }
      }
      
      // Inject Handsfree
      $.handsfree.js.src = 'https://unpkg.com/handsfree@latest/build/lib/handsfree.js'
      $.handsfree.css.setAttribute('rel', 'stylesheet')
      $.handsfree.css.setAttribute('type', 'text/css')
      $.handsfree.css.setAttribute('href', 'https://unpkg.com/handsfree@latest/build/lib/assets/handsfree.css')

      // Inject dashboard
      $.dashboard.iframe.src = rootURI + '/dashboard/dist/index.html'
      $.dashboard.iframe.id = 'pixelfelt-dashboard'
      $.dashboard.css.setAttribute('rel', 'stylesheet')
      $.dashboard.css.setAttribute('type', 'text/css')
      $.dashboard.css.setAttribute('href', rootURI + '/iframe.css')

      /**
       * Configure Handsfree.js and load scripts
       */
      $.handsfree.js.onload = function () {
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
                const $css = document.createElement('link')
                $css.setAttribute('rel', 'stylesheet')
                $css.setAttribute('type', 'text/css')
                $css.setAttribute('href', rootURI + '/' + css)
                document.head.appendChild($css)
              })
            }
          })
        })

        handsfree.start()
      }

      // Inject things
      document.head.appendChild($.handsfree.css)
      document.head.appendChild($.dashboard.css)
      document.body.appendChild($.handsfree.js)
      document.body.appendChild($.dashboard.iframe)
    })
})()