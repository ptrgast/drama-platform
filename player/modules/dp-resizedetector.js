module.exports = function() {

  var thisobj = this;
  this._elements = [];
  this._watchInterval = 500;
  this._watchTimer = null;

  this._init = function() {
    this._watchTimer = setInterval(function() {thisobj._watch();}, this._watchInterval);
  }

  this._watch = function() {
    for(var i=0; i<this._elements.length; i++) {
      var current = this._elements[i];
      var currentWidth = current.element.offsetWidth;
      var currentHeight = current.element.offsetHeight;
      if(currentWidth!=current.lastWidth || currentHeight!=current.lastHeight) {
        //element resized since last check
        console.log("Resized", current.element);
        if(typeof current.element.onresize=="function") {
          current.element.onresize();
        }
      }
      current.lastWidth = currentWidth;
      current.lastHeight = currentHeight;
    }
  }

  this.watchElement = function(element) {
    this._elements.push({
      element:element,
      lastWidth:element.offsetWidth,
      lastHeight:element.offsetHeight
    });
  }

  this._init();

}
