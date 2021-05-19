(function () {
  // Inject dependencies 
  if (typeof p5 === 'undefined') {
    const $p5Script = document.createElement('script')
    $p5Script.id = 'p5script'
    $p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/p5.js'
    document.body.appendChild($p5Script) 
  } 

  let prevPointer = [
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
  ]
  
  // Setup Handsfree.js
  handsfree.update({
    hands: true
  })
  handsfree.enablePlugins('browser') 
  document.body.setAttribute('style', 'overflow: visible')


  /** 
   * Setup
   * - Configure handsfree (set which models, plugins, and gestures you want to use)
   * - Create start/stop buttons. It's nice to always ask user for permission to start webcam :)
   */
  window.setup = function () {
    if (typeof sketch == 'undefined') {
      sketch = createCanvas(window.innerWidth, 3000)
    }

    // P5 canvas
    sketch.id = 'p5sketch'
    sketch.elt.style.position = 'absolute'
    sketch.elt.style.width = '100%'
    sketch.elt.style.top = '0'
    sketch.elt.style.left = '0'
    sketch.elt.style.pointerEvents = 'none'

    // Colors for each fingertip
    colorMap = [
      // Left fingertips
      [color(0, 0, 0), color(255, 0, 255), color(0, 0, 255), color(255, 255, 255)],
      // Right fingertips
      [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 255, 0)]
    ]
  }






  /**
   * Main draw loop
   */
  window.draw = function () {
    fingerPaint()
  }


  /**
   * Draw the pointer inside of p5
   */
  window.drawPointer = function () {
    const hands = handsfree.data?.hands
    if (hands?.landmarks?.[1]?.[8]?.x) {
      // Store the paint
      fill(255, 0, 0)
      circle(sketch.width - hands.landmarks[1][8].x * sketch.width, hands.landmarks[1][8].y * sketch.height, 10)
    }
  }



  /**
   * #2 Finger paint
   * Since p5.js already has it's own loop, we just check the data directly
   * @see https://handsfree.js.org/ref/plugin/pinchers.html
   */
  // Whenever we pinch and move we'll store those points as a set of [x1, y1, handIndex, fingerIndex, size]
  window.paint = []

  window.fingerPaint = function () {
    // Check for pinches and create dots if something is pinched
    const hands = handsfree.data?.hands
    let bounds = sketch.elt.getBoundingClientRect()

    // Paint with fingers
    if (hands?.pinchState) {
      // Loop through each hand
      hands.pinchState.forEach((hand, handIndex) => {
        if (!handIndex) return
        
        // Loop through each finger
        hand.forEach((state, finger) => {
          if (hands.pointer[handIndex].y >= bounds.y && hands.pointer[handIndex].y <= bounds.y + bounds.height) {
            let x = hands.pointer[handIndex].x - bounds.x
            let y = hands.pointer[handIndex].y - bounds.y
            
            fill(colorMap[handIndex][finger])
            stroke(colorMap[handIndex][finger])
            strokeWeight(10)
    
            // Draw a circle on the spot that we started
            if (state === 'start') {
              prevPointer[handIndex][finger] = {x, y}

            // Draw line from circle
            } else if (state === 'held') {
              line(prevPointer[handIndex][finger].x, prevPointer[handIndex][finger].y, x, y)
            }

            // Set the last position
            prevPointer[handIndex][finger] = {
              x: hands.pointer[handIndex].x - bounds.x,
              y: hands.pointer[handIndex].y - bounds.y
            }
          }
        })
      })  
    } 
      
    // Clear everything if the left [0] pinky [3] is pinched
    if (hands?.pinchState && hands.pinchState[0][3] === 'released') {
      clear()
    }
  }
 



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