/**
 * Reads package.json and determines the file to use
 */
(function () {
  // All other assets are relative to this URL
  const rootURI = document.currentScript.src.split('/loader.js')[0]
  let $, $pipCanvas, pipContext, $videoPip
  let manifestCode = ''
  let manifestScriptsLoading = 0

  /**
   * Displays an error if a dependency can't load
   */
  const handleError = function (err) {
    alert('😞 Pixelfelt Load Error\n\nPlease refresh the page and try again. If you get this message again then Pixelfelt might not work on this page.')
    return err
  }

  /**
   * Load the code into the main page and dashboard
   */
  const maybeLoadCode = function () {
    if (!manifestScriptsLoading) {
      if (manifestCode) {
        setTimeout(() => {
          eval(manifestCode)
          $.dashboard.iframe.contentWindow.postMessage({
            action: 'editor.loadCode',
            code: manifestCode
          }, '*')
          handsfree.start()
        }, 0)
      } else {
        setTimeout(() => {
          $.dashboard.iframe.contentWindow.postMessage({
            action: 'editor.loadCode',
            code: `(function () {
  handsfree.use('custom', {
    onFrame ({hands, weboji, pose, handpose, facemesh}) {
      if (!hands && !weboji && !pose && !handpose && !facemesh) return
      try {
        

      } catch (err) {
        console.error(err)
      }
    }
  })
})()`
          }, '*')
          handsfree.start()
        }, 0)
      }
    }
  }
  
  /**
   * Load the package and dependencies
   */
  fetch(rootURI + '/package.json')
    .then(response => response.json())
    .then(package => {
      $ = {
        handsfree: {
          js: document.createElement('script'),
          css: document.createElement('link')
        },
        dashboard: {
          iframe: document.createElement('iframe'),
          css: document.createElement('link')
        },
        handle: document.createElement('div'),
        loader: {
          wrapper: document.createElement('div'),
          mask: document.createElement('div')
        }
      }
      
      // Setup handsfree dependencies
      $.handsfree.js.src = 'https://unpkg.com/handsfree@latest/build/lib/handsfree.js'
      $.handsfree.css.setAttribute('rel', 'stylesheet')
      $.handsfree.css.setAttribute('type', 'text/css')
      $.handsfree.css.setAttribute('href', 'https://unpkg.com/handsfree@latest/build/lib/assets/handsfree.css')
      $.handsfree.js.onerror = handleError

      // Setup dashboard dependencies
      $.dashboard.iframe.src = 'https://unpkg.com/pixelfelt-blockly@2021.5.11-9/dist/index.html'
      $.dashboard.iframe.id = 'pixelfelt-dashboard'
      $.dashboard.iframe.classList.add('handsfree-show-when-started')
      $.dashboard.css.setAttribute('rel', 'stylesheet')
      $.dashboard.css.setAttribute('type', 'text/css')
      $.dashboard.css.setAttribute('href', rootURI + '/assets/iframe.css')

      // Setup handle
      $.handle.id = 'pixelfelt-dashboard-handle'
      $.handle.classList.add('handsfree-show-when-started')
      
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
        let matchesFound = 0
        Object.keys(package.sitemanifest.sites).forEach(n => {
          const site = package.sitemanifest.sites[n]
          
          if (typeof site.matches === 'string') site.matches = [site.matches]
          if (typeof site.js === 'string') site.js = [site.js]
          if (typeof site.css === 'string') site.css = [site.css]
  
          // Inject scripts
          site.matches.forEach(match => {
            const regexp = new RegExp(match)
            if (regexp.test(window.location.href)) {
              // Inject JS
              site.js && site.js.forEach(script => {
                ++manifestScriptsLoading
                ++matchesFound

                fetch(rootURI + '/' + script)
                  .then(response => response.text())
                  .then(code => manifestCode += code + '\n\n')
                  .then(() => {
                    --manifestScriptsLoading
                    maybeLoadCode()
                  })
                  .catch(handleError)
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

        // No matches found so load default
        if (!matchesFound) {
          maybeLoadCode()
        }

        /**
         * Picture in Picture
         */
        // This will receive the layers and stream
        $pipCanvas = document.createElement('CANVAS')
        document.body.appendChild($pipCanvas)
        pipContext = $pipCanvas.getContext('2d')
        pipContext.globalAlpha = .2
        $pipCanvas.style.display = 'none'

        // This will be the video we pip
        $videoPip = document.createElement('VIDEO')
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

        setTimeout(() => {
          handsfree.debug.$wrap.style.display = 'none'
        }, 0)
      }

      // Inject scripts
      document.head.appendChild($.handsfree.css)
      document.head.appendChild($.dashboard.css)
      document.body.appendChild($.handsfree.js)
      document.body.appendChild($.dashboard.iframe)
      document.body.appendChild($.loader.mask)
      document.body.appendChild($.loader.wrapper)
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
       * Loader
       */
      $.loader.mask.classList.add('handsfree-show-when-loading', 'handsfree-hide-when-started')
      $.loader.wrapper.classList.add('handsfree-show-when-loading', 'handsfree-hide-when-started')
      
      $.loader.wrapper.style.position = 'fixed'
      $.loader.wrapper.style.width = '450px'
      $.loader.wrapper.style.left = '50%'
      $.loader.wrapper.style.marginLeft = '-225px'
      $.loader.wrapper.style.bottom = '50%'
      $.loader.wrapper.style.zIndex = '999999999999'
      $.loader.wrapper.style.boxShadow = '3px 3px 6px 3px rgba(0,0,0,0.35)'
      $.loader.wrapper.style.background = '#1e1e3f'
      $.loader.wrapper.style.color = '#fff'
      $.loader.wrapper.style.borderRadius = '3px'
      $.loader.wrapper.style.padding = '20px'

      $.loader.mask.style.position = 'fixed'
      $.loader.mask.style.zIndex = '999999999998'
      $.loader.mask.style.left = '0'
      $.loader.mask.style.bottom = '0%'
      $.loader.mask.style.width = '100%'
      $.loader.mask.style.height = '100%'
      $.loader.mask.style.background = 'rgba(0,0,0,0.35)'

      $.loader.wrapper.innerHTML = `<div style="text-align: center !important">
        <p><img src="${rootURI}/assets/logo-title.png" width=300 height="auto"></p>
        <p style="font-size: 36px !important; color: #fff !important; text-shadow: none !important">Loading...</p>
        <p style="font-size: 18px !important; color: #FF9D00 !important;">${package.version}</p>
      </div>`

      /**
       * Listen for new messages
       */
      window.addEventListener('message', (event) => {
        switch (event.data.action) {
          // Load code
          case 'pixelfelt.ready':
            maybeLoadCode()
          break
          
          // Run code
          case 'pixelfelt.editor.runCode':
            eval(event.data.code)
          break

          // Autosave code
          case 'pixelfelt.editor.autosave':
            localStorage.setItem('pixelfeltCode', event.data.code)
          break

          // Picture in Picture
          case 'pixelfelt.showDebugger':
            $videoPip.requestPictureInPicture()
          break

          // Maximize
          case 'pixelfelt.maximize':
            $.dashboard.iframe.setAttribute('style', `height: 100% !important`)
            $.handle.setAttribute('style', `bottom: calc(100% - 8px) !important`)
          break
            
          // Minimize
          case 'pixelfelt.minimize':
            $.dashboard.iframe.setAttribute('style', `height: 82px !important`)
            $.handle.setAttribute('style', `bottom: 82px !important`)
          break
        }
      })
    })
    .catch(handleError)
})()