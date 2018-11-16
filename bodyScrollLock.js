// Adopted and modified solution from Bohdan Didukh (2017)
// https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi
'use strict';

var isIosDevice =
  typeof window !== 'undefined' &&
  window.navigator &&
  window.navigator.platform &&
  /iP(ad|hone|od)/.test(window.navigator.platform);

var body = typeof document !== 'undefined' && document.body;
var documentElement =
  typeof document !== 'undefined' && document.documentElement;

var allElements = [];
var previousStyles;
var scrollTop;
var scrollLeft;
var reserveScrollBarGap;
var backgroundElement;

function setStyle(style, newStyle) {
  for (var v in newStyle) {
    if (newStyle[v] !== undefined) style[v] = newStyle[v];
  }
}

function getStyle(style) {
  return {
    overflow: style.overflow,
    position: style.position,
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    paddingRight: style.paddingRight,
  };
}

function disableBodyScroll(element, options) {
  if (!element) throw new Error('element must be provided');

  reserveScrollBarGap = options && options.reserveScrollBarGap;

  // Already have this element.
  if (allElements.indexOf(element) !== -1) return;

  allElements.push(element);

  var firstElement = allElements.length === 1;

  if (!firstElement) return;

  // Already called, do not continue.
  if (previousStyles !== undefined) return;

  if (isIosDevice) {
    previousStyles = [getStyle(body.style)];
    scrollTop = body.scrollTop;
    scrollLeft = body.scrollLeft;

    // Create a background element to cover buggy original.
    backgroundElement = document.createElement('div');
    setStyle(backgroundElement.style, {
      zIndex: -1,
      position: 'fixed',
      width: body.scrollWidth,
      height: body.scrollHeight,
      top: -scrollTop + 'px',
      left: -scrollLeft + 'px',
      backgroundColor: window
        .getComputedStyle(body, null)
        .getPropertyValue('background-color'),
      backgroundImage: window
        .getComputedStyle(body, null)
        .getPropertyValue('background-image'),
    });
    body.appendChild(backgroundElement);

    setStyle(body.style, {
      position: 'fixed',
      width: body.scrollWidth,
      height: body.scrollHeight,
      top: -scrollTop + 'px',
      left: -scrollLeft + 'px',
    });
  } else {
    previousStyles = [getStyle(body.style)];
    var scrollBarGap = window.innerWidth - documentElement.clientWidth;

    setStyle(body.style, {
      overflow: 'hidden',
      paddingRight:
        reserveScrollBarGap && scrollBarGap > 0
          ? scrollBarGap +
            parseFloat(
              window
                .getComputedStyle(body, null)
                .getPropertyValue('padding-right')
            ) +
            'px'
          : undefined,
    });
  }
}

function enableBodyScroll(element) {
  if (!element) throw new Error('element must be provided');

  var index = allElements.indexOf(element);

  // Element was not found. Should this throw?
  if (index === -1) return;

  allElements.splice(index, 1);

  var lastElement = allElements.length === 0;

  if (!lastElement) return;

  if (previousStyles === undefined) return;

  if (isIosDevice) {
    setStyle(body.style, previousStyles[0]);
    body.removeChild(backgroundElement);
    body.scrollTop = scrollTop;
    body.scrollLeft = scrollLeft;
  } else {
    setStyle(body.style, previousStyles[0]);
  }
  previousStyles = undefined;
}

function clearAllBodyScrollLocks() {
  allElements.slice(0).forEach(enableBodyScroll);
}

module.exports = {
  disableBodyScroll: disableBodyScroll,
  enableBodyScroll: enableBodyScroll,
  clearAllBodyScrollLocks: clearAllBodyScrollLocks,
};
