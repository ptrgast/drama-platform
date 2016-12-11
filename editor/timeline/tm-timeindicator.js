module.exports = function(timeline) {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._DragInParentHelper = require("./tm-draghelper.js");

  //--Variables--//

  this._timeline = timeline;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "time-indicator";
  this._container.style.cssText = "position: absolute; width:3px; height:100%; top:0px; border:1px solid #b55d5d; z-index:3; cursor:ew-resize; box-shadow:-2px 0px 2px rgba(0,0,0,0.5)";

  //--Functions--//

  this._setPosition = function(newTime) {
    var newPosition = this._timeline._groupLabelsWidth+this._timeline._timeToX(newTime);
    this._container.style.marginLeft = newPosition+"px";
  }

  this.refresh = function() {
    this._setPosition(this._timeline._currentTime);
  }

  this._dragStartTime = 0;
  this._lastDragEvent = null;
  this._onDrag = function(dragEvent) {
    if(dragEvent.started) {
      thisobj._dragStartTime = thisobj._timeline._currentTime;
    } else if(!dragEvent.ended) {
      var newTime = (dragEvent.dx*thisobj._timeline._viewportResolution/thisobj._timeline._viewportScale)|0
      thisobj._setPosition(thisobj._dragStartTime+newTime);
    } else {
      var newTime = (thisobj._lastDragEvent.dx*thisobj._timeline._viewportResolution/thisobj._timeline._viewportScale)|0
      thisobj._timeline._currentTime = thisobj._dragStartTime+newTime;
      thisobj.refresh();
      thisobj._dragStartTime = 0;
      thisobj.onDrag();
    }
    thisobj._lastDragEvent = dragEvent;
  }
  this._dragHelper = new this._DragInParentHelper(this._container, timeline._container, this._onDrag);

  this.onDrag = function() {}

}
