(function () {
  handsfree.plugin.pinchScroll.disable()
  
  // Pause Play
  const pausePlay = handsfree.throttle(function () {
    console.log('🤘')
    document.querySelector('video').click()
  }, 1000, {trailing: false})

  // Skip forward
  const skipForward = handsfree.throttle(function () {
    console.log('👉')
    document.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'ArrowRight',
      key: 'ArrowRight',
      charKode: 39,
      keyCode: 39,
      view: window
    }))
  }, 1000, {trailing: false})

  // Skip back
  const skipBackward = handsfree.throttle(function () {
    console.log('👈')
    document.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'ArrowLeft',
      key: 'ArrowLeft',
      charKode: 37,
      keyCode: 37,
      view: window
    }))
  }, 1000, {trailing: false})

  // Volume control
  const volumeControl = handsfree.throttle(function () {
    let volume = .5 + (handsfree.data.hands?.origPinch?.[1]?.[0].y - handsfree.data.hands?.curPinch?.[1]?.[0].y)
    volume = Math.min(1, volume)
    volume = Math.max(0, volume)
    document.querySelector('video').volume = volume
  }, 1000, {trailing: false})

  /**
   * YouTube Plugin
   */
  handsfree.use('youtube', {
    onFrame ({hands, weboji, pose, handpose, facemesh}) {
      if (!hands && !weboji && !pose && !handpose && !facemesh) return
      try {
        // 🤘
        if (handsfree.model.hands.getGesture()[0]?.name === 'horns' || handsfree.model.hands.getGesture()[1]?.name === 'horns') {
          pausePlay()
        }

        // 👉
        if (handsfree.model.hands.getGesture()[0]?.name === 'pointRight') {
          skipForward()
        }

        // 👈
        if (handsfree.model.hands.getGesture()[1]?.name === 'pointLeft') {
          skipBackward()
        }

        // Volume control
        if (handsfree.data.hands.pinchState?.[1][0] === 'held') {
          volumeControl()
        }
      } catch (err) {
        console.error(err)
      }
    }
  })

  /**
   * 🤘
   */
  handsfree.useGesture({
    "name": "horns",
    "algorithm": "fingerpose",
    "models": "hands",
    "confidence": 7.5,
    "description": [
      [
        "addCurl",
        "Thumb",
        "HalfCurl",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "VerticalUp",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpRight",
        0.9
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpLeft",
        0.4
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
        "VerticalUp",
        1
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpLeft",
        0.6428571428571429
      ],
      [
        "addCurl",
        "Middle",
        "FullCurl",
        1
      ],
      [
        "addDirection",
        "Middle",
        "VerticalUp",
        0.15
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpLeft",
        1
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
        "DiagonalUpLeft",
        1
      ],
      [
        "addDirection",
        "Ring",
        "VerticalUp",
        0.9166666666666666
      ],
      [
        "addCurl",
        "Pinky",
        "NoCurl",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "VerticalUp",
        0.6666666666666666
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpLeft",
        0.25
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpLeft",
        0.9
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpRight",
        0.4
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpRight",
        0.6428571428571429
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Ring",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpLeft",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpRight",
        0.25
      ],
      [
        "setWeight",
        "Index",
        2
      ],
      [
        "setWeight",
        "Pinky",
        2
      ]
    ]
  })

  handsfree.useGesture({
    "name": "pointRight",
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
        "addDirection",
        "Thumb",
        "DiagonalDownLeft",
        0.03571428571428571
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
        0.16
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
        0.11538461538461539
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
        "addDirection",
        "Ring",
        "DiagonalUpLeft",
        0.07407407407407407
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
        "Pinky",
        "DiagonalDownLeft",
        0.07407407407407407
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
    ]
  })

  handsfree.useGesture({
    "name": "pointLeft",
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
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalDownRight",
        0.3333333333333333
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
        "DiagonalUpRight",
        0.2
      ],
      [
        "addDirection",
        "Index",
        "HorizontalRight",
        1
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
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpRight",
        0.09090909090909091
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
        "HorizontalRight",
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
        "HorizontalRight",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalDownRight",
        0.5
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
    ]
  })  
})()