/**
 * @see https://pixelfelt.com/site/teropa-info/musicmouse
 * @see https://teropa.info/musicmouse/
 */
 (function () {
  // Setup Handsfree.js
  handsfree.enablePlugins('browser')
  handsfree.update({
    hands: true,
    weboji: false,
    facemesh: false,
    handpose: false,
    pose: false
  })
  
  const $target = document.querySelector('app-pointer-surface')

  /**
   * Use mousemove API
   */
  handsfree.use('musicmouse', {
    // The higher this number the more you have to move to hit the next key
    moveFriction: 1.5,
    
    last: {
      x: 0,
      y: 0
    },

    /**
     * Runs on every frame
     */  
    onFrame ({hands, weboji}) {
      // FACE
      if (weboji) {
        if (weboji.state.browsUp) {
          setTimeout(() => {
            handsfree.model.weboji.disable()
            handsfree.model.hands.enable()
            handsfree.update({
              hands: true,
              weboji: false
            })
          }, 0)
        }
      }

      // HANDS
      if (hands.pointer) {
        if (handsfree.model.hands.getGesture()?.[0]?.name === 'pointingAtEyes' && handsfree.model.hands.getGesture()?.[1]?.name === 'pointingAtEyes') {
          handsfree.model.weboji.enable()
          handsfree.model.hands.disable()
        }

        // Apply movement
        if (hands.pinchState[1][0] === 'held' && hands.pointer[1].isVisible) {
          $target.dispatchEvent(new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            movementX: (hands.pointer[1].x - this.last.x) / this.moveFriction,
            movementY: (hands.pointer[1].y - this.last.y) / this.moveFriction
          }))
        }
    
        // Update movement deltas
        if (hands.pointer[1]?.isVisible) {
          this.last.x = hands.pointer[1].x
          this.last.y = hands.pointer[1].y
        }
    
        // Change Treatment
        if (hands.pinchState[0][0] === 'start') {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            view: window,
            bubbles: true,
            cancelable: true,
            altKey: true,
            code: 'Digit1'
          }))
        }
        if (hands.pinchState[0][1] === 'start') {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            view: window,
            bubbles: true,
            cancelable: true,
            altKey: true,
            code: 'Digit2'
          }))
        }
      }
    }
  })

  handsfree.useGesture({
    "name": "pointingAtEyes",
    "algorithm": "fingerpose",
    "models": "hands",
    "confidence": 7.5,
    "description": [
      [
        "addCurl",
        "Thumb",
        "NoCurl",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "HorizontalLeft",
        1
      ],
      [
        "addCurl",
        "Index",
        "NoCurl",
        1
      ],
      [
        "addDirection",
        "Index",
        "HorizontalLeft",
        1
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpLeft",
        0.5
      ],
      [
        "addCurl",
        "Middle",
        "NoCurl",
        1
      ],
      [
        "addDirection",
        "Middle",
        "HorizontalLeft",
        1
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpLeft",
        0.5
      ],
      [
        "addCurl",
        "Ring",
        "FullCurl",
        1
      ],
      [
        "addDirection",
        "Ring",
        "HorizontalLeft",
        1
      ],
      [
        "addCurl",
        "Pinky",
        "FullCurl",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "HorizontalLeft",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Index",
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpRight",
        0.5
      ],
      [
        "addDirection",
        "Middle",
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpRight",
        0.5
      ],
      [
        "addDirection",
        "Ring",
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "HorizontalRight",
        1
      ],
      [
        "setWeight",
        "Index",
        2
      ],
      [
        "setWeight",
        "Middle",
        2
      ]
    ],
    "enabled": true
  })  
})()

