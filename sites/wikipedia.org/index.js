(function () {
  // Inject dependencies 
  if (typeof p5 === 'undefined') {
    const $p5Script = document.createElement('script')
    $p5Script.id = 'p5script'
    $p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/p5.js'
    document.body.appendChild($p5Script) 
  } 

  // Setup Handsfree.js
  handsfree.update({
    hands: true
  })
  handsfree.enablePlugins('browser') 
  document.body.setAttribute('style', 'overflow: visible')
  document.querySelectorAll('.handsfree-pointer').forEach($pointer => {
    $pointer.style.visibility = 'hidden'
  })

  handsfree.use('custom', {
    onFrame ({hands, weboji, pose, handpose, facemesh}) {
      if (!hands && !weboji && !pose && !handpose && !facemesh) return
      try { 
        

      } catch (err) {
        console.error(err)
      }
    }
  })


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
    background('rgba(0,0,0,0)')
    clear()
    fingerPaint()
    // drawHands()
    drawPointer()
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
    if (hands?.pinchState) {
      // Loop through each hand
      hands.pinchState.forEach((hand, handIndex) => {
        if (!handIndex) return
        
        // Loop through each finger
        hand.forEach((state, finger) => {
          // Other states are "start" and "released"
          if (state === 'held') {
            // Left [0] index finger [0] is the eraser, so let's make it paint larger
            const circleSize = handIndex === 0 && finger === 0 ? 40 : 10
            
            // Store the paint
            paint.push([hands.curPinch[handIndex][finger].x, hands.curPinch[handIndex][finger].y, handIndex, finger, circleSize])
          }
        })
      })  
    } 
      
    // Draw the paint
    paint.forEach((dot, i) => {
      // Draw dot
      fill(colorMap[dot[2]][dot[3]])
      circle(sketch.width - dot[0] * sketch.width, dot[1] * sketch.height, dot[4])

      stroke(colorMap[dot[2]][dot[3]])
      strokeWeight(dot[4])

      // Draw line
      if (i > 1) {
        line(sketch.width - paint[i-1][0] * sketch.width, paint[i-1][1] * sketch.height, sketch.width - paint[i][0] * sketch.width, paint[i][1] * sketch.height)
      }
    })
    
    // Clear everything if the left [0] pinky [3] is pinched
    if (hands?.pinchState && hands.pinchState[0][3] === 'released') {
      paint = []
    }
  }

 




  /**
   * #3 Draw the hands into the P5 canvas
   * @see https://handsfree.js.org/ref/model/hands.html#data
   */
  window.drawHands = function () {
    const hands = handsfree.data?.hands
    
    // Bail if we don't have anything to draw
    if (!hands?.landmarks) return
    
    // Draw keypoints
    hands.landmarks.forEach((hand, handIndex) => {
      hand.forEach((landmark, landmarkIndex) => {
        // Set color
        // @see https://handsfree.js.org/ref/model/hands.html#data
        if (colorMap[handIndex]) {
          switch (landmarkIndex) {
            case 8: fill(colorMap[handIndex][0]); break
            case 12: fill(colorMap[handIndex][1]); break
            case 16: fill(colorMap[handIndex][2]); break
            case 20: fill(colorMap[handIndex][3]); break
            default:
              fill(color(255, 255, 255))
          }                
        }
        
        // Set stroke
        if (handIndex === 0 && landmarkIndex === 8) {
          stroke(color(255, 255, 255))
          strokeWeight(5)
          circleSize = 40
        } else {
          stroke(color(0, 0, 0))
          strokeWeight(0)
          circleSize = 10
        }
        
        circle(
          // Flip horizontally
          sketch.width - landmark.x * sketch.width,
          landmark.y * sketch.height,
          circleSize
        )
      })
    })
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