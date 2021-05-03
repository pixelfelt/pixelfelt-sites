/**
 * @see https://pixelfelt.com/site/withgoogle-com-blob-opera
 * @see https://gacembed.withgoogle.com/blob-opera
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

  // Maps handsfree pincher events to 
  const eventMap = {
    start: 'mousedown',
    held: 'mousemove',
    released: 'mouseup'
  }

  handsfree.use('blobOpera', {
    onFrame: ({hands}) => {
      if (!hands.multiHandLandmarks) return

      hands.pointer.forEach((pointer, hand) => {
        if (pointer.isVisible && hands.pinchState[hand][0]) {
          // Get the event and element to send events to
          const event = eventMap[hands.pinchState[hand][0]]
          const $el = document.elementFromPoint(pointer.x, pointer.y)
          
          // Dispatch the event
          if ($el) {
            $el.dispatchEvent(
              new MouseEvent(event, {
                bubbles: true,
                cancelable: true,
                clientX: pointer.x,
                clientY: pointer.y
              })
            )
          }
        }
      })
    }
  })
})()