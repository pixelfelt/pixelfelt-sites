/**
 * Click and drag sketchfabs
 */
(function () {
  // Setup Handsfree.js
  handsfree.update({
    hands: true,
    weboji: false,
    facemesh: false,
    handpose: false,
    pose: false
  })
  
  // Event mapper
  const eventMap = {
    start: 'mousedown',
    held: 'mousemove',
    released: 'mouseup'
  }
  
  // Pinch to turn 3D model
  handsfree.use('sketchfab', {
    onFrame: ({hands}) => {
      if (!hands.pointer) return
  
      // Pan the sketch
      if (hands.pointer[1].isVisible && hands.pinchState[1][0]) {
        // Get the event and element to send events to
        const event = eventMap[hands.pinchState[1][0]]
        const $el = document.elementFromPoint(hands.pointer[1].x, hands.pointer[1].y)
        
        // Dispatch the event
        if ($el) {
          let $canvas
          
          // Find the canvas inside the iframe
          if ($el.tagName.toLocaleLowerCase() === 'canvas' && $el.classList.contains('canvas')) {
            $canvas = $el
          } else if ($el.tagName.toLocaleLowerCase() === 'iframe' && $el.src.startsWith('https://sketchfab.com/models')) {
            $canvas = $el.contentWindow.document.querySelector('canvas.canvas')
          }
  
          if ($canvas) {
            $canvas.dispatchEvent(
              new MouseEvent(event, {
                bubbles: true,
                cancelable: true,
                clientX: hands.pointer[1].x,
                clientY: hands.pointer[1].y
              })
            )  
          }
        }
      }
  
      // Click on things
      if (hands.pinchState[1][0] === 'start' && hands.pointer[1].x) {
        const $el = document.elementFromPoint(hands.pointer[1].x, hands.pointer[1].y)
        console.log($el, 'click')
        if ($el && $el.classList.contains('c-model-360-preview')) {
          $el.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: hands.pointer[1].x,
              clientY: hands.pointer[1].y
            })
          )
        }
      }
  
      // Escape key
      if (hands.pinchState[0][3] === 'start') {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          keyCode: 27
        }))
      }
    }
  })
  
  /**
   * Update pinch scroll so that it only works with left hand
   */
  handsfree.plugin.pinchScroll.onFrame = function ({hands}) {
    // Wait for other plugins to update
    setTimeout(() => {
      if (!hands.pointer) return
      const height = this.handsfree.debug.$canvas.hands.height
      const width = this.handsfree.debug.$canvas.hands.width
  
      hands.pointer.forEach((pointer, n) => {
        // Only left hand
        if (n) return
        
        // @fixme Get rid of n > origPinch.length
        if (!pointer.isVisible || n > hands.origPinch.length) return
  
        // Start scroll
        if (hands.pinchState[n]?.[0] === 'start') {
          let $potTarget = document.elementFromPoint(pointer.x, pointer.y)
  
          this.$target[n] = this.getTarget($potTarget)
          this.tweenScroll[n].x = this.origScrollLeft[n] = this.getTargetScrollLeft(this.$target[n])
          this.tweenScroll[n].y = this.origScrollTop[n] = this.getTargetScrollTop(this.$target[n])
          this.handsfree.TweenMax.killTweensOf(this.tweenScroll[n])
        }
  
        if (hands.pinchState[n]?.[0] === 'held' && this.$target[n]) {
          // With this one it continuously moves based on the pinch drag distance
          this.handsfree.TweenMax.to(this.tweenScroll[n], 1, {
            x: this.tweenScroll[n].x - (hands.origPinch[n][0].x - hands.curPinch[n][0].x) * width * this.config.speed,
            y: this.tweenScroll[n].y + (hands.origPinch[n][0].y - hands.curPinch[n][0].y) * height * this.config.speed,
            overwrite: true,
            ease: 'linear.easeNone',
            immediateRender: true  
          })
  
          this.$target[n].scrollTo(this.tweenScroll[n].x, this.tweenScroll[n].y)
        }
      })
    })
  }
})()