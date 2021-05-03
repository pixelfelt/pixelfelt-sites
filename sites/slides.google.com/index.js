(function () {
  // Next Slide
  const nextSlide = handsfree.throttle(function () {
    document.querySelector('.punch-present-iframe')?.contentDocument.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'ArrowRight',
      key: 'ArrowRight',
      charKode: 39,
      keyCode: 39,
      view: window
    }))
  }, 1000, { 'trailing': false })

  // Prev Slide
  const prevSlide = handsfree.throttle(function () {
    document.querySelector('.punch-present-iframe')?.contentDocument.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'ArrowLeft',
      key: 'ArrowLeft',
      charKode: 37,
      keyCode: 37,
      view: window
    }))
  }, 1000, { 'trailing': false })

  handsfree.use('custom', {
    onFrame ({hands, weboji, pose, handpose, facemesh}) {
      if (!hands && !weboji && !pose && !handpose && !facemesh) return
      try {
        // Pointing Right
        if (handsfree.model.hands.getGesture()[0]?.name == 'pointRight') {
          nextSlide()
        }

        // Pointing Left
        if (handsfree.model.hands.getGesture()[1]?.name == 'pointLeft') {
          prevSlide()
        }

      } catch (err) {
        console.error(err)
      }
    }
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