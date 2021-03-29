/**
 * Reads manifest.json and determines the file to use
 */
(function () {
  const rootURI = document.currentScript.src
  
  // Load the manifest
  fetch(rootURI + '/manifest.json')
    .then(response => response.json())
    .then(manifest => {
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
            site.js.forEach(script => {
              const $script = document.createElement('script')
              $script.src = rootURI + '/' + script
              document.body.appendChild($script)
            })

            // Inject CSS
            site.css.forEach(css => {
              const $link = document.createElement('link')
              $link.setAttribute('rel', 'stylesheet')
              $link.setAttribute('type', 'text/css')
              $link.setAttribute('href', rootURI + '/' + css)
              document.head.appendChild($link)
            })
          }
        })
      })
    })
})()