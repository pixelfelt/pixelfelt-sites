/**
 * Reads manifest.json and determines the file to use
 */
(function () {
  // All other assets are relative to this URL
  const rootURI = document.currentScript.src.split('/loader.js')[0]

  /**
   * Displays an error if a dependency can't load
   */
  const handleError = function () {alert('😞 Pixelfelt Load Error\n\nPlease refresh the page and try again. If you get this message again then Pixelfelt might not work on this page.')}
  
  /**
   * Load the manifest and dependencies
   */
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
        },
        handle: document.createElement('div')
      }
      
      // Setup handsfree dependencies
      $.handsfree.js.src = 'https://unpkg.com/handsfree@latest/build/lib/handsfree.js'
      $.handsfree.css.setAttribute('rel', 'stylesheet')
      $.handsfree.css.setAttribute('type', 'text/css')
      $.handsfree.css.setAttribute('href', 'https://unpkg.com/handsfree@latest/build/lib/assets/handsfree.css')
      $.handsfree.js.onerror = handleError

      // Setup dashboard dependencies
      $.dashboard.iframe.src = 'https://unpkg.com/pixelfelt-blockly@latest/dist/index.html'
      $.dashboard.iframe.id = 'pixelfelt-dashboard'
      $.dashboard.css.setAttribute('rel', 'stylesheet')
      $.dashboard.css.setAttribute('type', 'text/css')
      $.dashboard.css.setAttribute('href', rootURI + '/iframe.css')

      // Setup handle
      $.handle.id = 'pixelfelt-dashboard-handle'
      
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

        /**
         * Picture in Picture
         */
        // This will receive the layers and stream
        const $pipCanvas = document.createElement('CANVAS')
        document.body.appendChild($pipCanvas)
        const pipContext = $pipCanvas.getContext('2d')
        pipContext.globalAlpha = .2
        $pipCanvas.style.display = 'none'

        // This will be the video we pip
        const $videoPip = document.createElement('VIDEO')
        document.body.appendChild($videoPip)
        $videoPip.style.display = 'none'

        handsfree.use('canvasUpdater', {
          onFrame () {
            // Merge all active models into a single layer
            pipContext.drawImage(handsfree.debug.$video, 0, 0, $pipCanvas.width, $pipCanvas.height)
            Object.keys(handsfree.model).forEach(name => {
              if (handsfree.model[name].enabled) {
                pipContext.drawImage(handsfree.debug.$canvas[name], 0, 0, $pipCanvas.width, $pipCanvas.height)
              }
            })
          }
        })

        // Setup the picture in picture
        handsfree.on('data', () => {
          $pipCanvas.width = $videoPip.width = handsfree.debug.$video.width
          $pipCanvas.height = $videoPip.height = handsfree.debug.$video.height
          $videoPip.srcObject = $pipCanvas.captureStream()
          $videoPip.onloadedmetadata = () => {
            $videoPip.play()
          }
          $videoPip.onplay = () => {
            $videoPip.requestPictureInPicture()
          }
        }, {once: true})

        handsfree.start(() => {
          handsfree.debug.$wrap.style.display = 'none'
        })
      }

      // Inject scripts
      document.head.appendChild($.handsfree.css)
      document.head.appendChild($.dashboard.css)
      document.body.appendChild($.handsfree.js)
      document.body.appendChild($.dashboard.iframe)
      document.body.appendChild($.handle)

      /**
       * Setup the handle and resizing
       */
      setTimeout(() => {
        // Start drag
        let isDragging = false
        $.handle.addEventListener('mousedown', () => {
          isDragging = true
          $.dashboard.iframe.classList.add('pixelfelt-no-pointer-events')
        })

        // Stop drag
        const stopDragging = () => {
          isDragging = false
          $.dashboard.iframe.classList.remove('pixelfelt-no-pointer-events')
        }
        document.body.addEventListener('mouseup', stopDragging)
        $.dashboard.iframe.addEventListener('mouseup', stopDragging)

        // Drag
        const drag = (event) => {
          if (isDragging) {
            $.dashboard.iframe.setAttribute('style', `height: ${window.innerHeight - event.y}px !important`)
            $.handle.setAttribute('style', `bottom: ${window.innerHeight - event.y - 5}px !important`)
          }
        }
        document.body.addEventListener('mousemove', drag)
      })

      /**
       * Listen for new code and inject it
       */
      window.addEventListener('message', (event) => {
        if (event.data.action === 'pixelfelt.editor.runCode') {
          eval(event.data.code)
        }
      })
    })
    .catch(handleError)
})()