/**
 * @see https://pixelfelt.com/site/sm64-gitlab-io
 * @see https://sm64.gitlab.io/
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
    start: 'pointerdown',
    released: 'pointerup'
  }
  
  /**
   * A custom plugin to use the PointerEvent instead of the traditional MouseEvent's
   */
  handsfree.use('mario64', {
    onFrame: ({hands}) => {
      // Bail if no hands
      if (!hands.multiHandLandmarks) return

      // Loop through the pointers for each hand...
      hands.pointer.forEach((pointer, hand) => {
        // ...and only use the first (left hand)
        if (hand) return
        
        // Move the pointer
        const $el = document.elementFromPoint(pointer.x || 0, pointer.y || 0)
        if ($el) {
          // Most of these are not required but need to move onto another task for now so YOLO!
          $el.dispatchEvent(new PointerEvent('pointermove', {
            altKey: false,
            altitudeAngle: 1.5707963267948966,
            azimuthAngle: 0,
            bubbles: true,
            button: -1,
            buttons: 1,
            cancelBubble: false,
            cancelable: true,
            clientX: pointer.x,
            clientY: pointer.y,
            composed: true,
            ctrlKey: false,
            currentTarget: null,
            defaultPrevented: false,
            detail: 0,
            eventPhase: 0,
            fromElement: null,
            height: 1,
            isPrimary: true,
            isTrusted: true,
            layerX: pointer.x,
            layerY: pointer.y,
            metaKey: false,
            movementX: 4,
            movementY: -2,
            offsetX: pointer.x,
            offsetY: pointer.y,
            pageX: pointer.x,
            pageY: pointer.y,
            pointerId: 1,
            pointerType: "mouse",
            pressure: 0.5,
            relatedTarget: null,
            returnValue: true,
            screenX: pointer.x,
            screenY: pointer.y,
            shiftKey: false,
            sourceCapabilities: null,
            srcElement: $el,
            tangentialPressure: 0,
            target: $el,
            tiltX: 0,
            tiltY: 0,
            timeStamp: Date.now(),
          }))
        }

        // Pinch Marios cheeks
        if ($el && pointer.isVisible && ['start', 'released'].includes(hands.pinchState[hand][0])) {
          // Get the event and element to send events to
          const event = eventMap[hands.pinchState[hand][0]]
          $el.dispatchEvent(
            new PointerEvent(event, {
              bubbles: true,
              button: 0,
              buttons: 1,
              cancelable: true,
              clientX: pointer.x,
              clientY: pointer.y,
              isPrimary: true,
              isTrusted: true,
              pointerId: 1,
              pointerType: "mouse",
              movementX: -28,
              movementY: -20,  
            })
          )
        }
      })
    }
  })
})()