module.exports = function(timeline) {
  var thisobj = this;

  //prototypes & includes
  this.log = require("./../../common/mod-log.js");
  this.DragHelper = require("./tm-draghelper.js");

  //--variables--//
  this._logName = "TimeHandle";
  this.scale = 1;
  this.time = 0;
  this.timeline = timeline;
  this.dragStart = null;
  this.dragHelper = null;

  //--elements--//
  this.container = document.createElement("div");
  this.container.className = "time-handle";
  this.container.style.cssText = "position:absolute;top:0;left:0;width:3px;height:100%;background-color:#b51;z-index:3;margin-left:4px;box-shadow:-2px 2px 2px rgba(0,0,0,.5);cursor:ew-resize;";

  //--functions--//
  this.setCurrentTime = function(time) {
    this.time = time;
    this.container.style.left = (this.time*this.scale-this.timeline.scrollableContainer.scrollLeft)+"px";
  }

  this.setScale = function(scale) {
      this.scale = scale;
      this.setCurrentTime(this.time);
  }

  this.setHorizontalOffset = function(offset) {
    this.container.style.left = (this.time*this.timeline.scale-offset)+"px";
  }

  //--initialize--//
  this.timeline.container.appendChild(this.container);

  this.dragHelper = new this.DragHelper(this.container, this.timeline.container, 0);
  this.dragHelper.onDragStart = function() {
    thisobj.dragStart = thisobj.time;
  }
  this.dragHelper.onDrag = function(distance) {
    var newTime = thisobj.dragStart+distance/thisobj.timeline.scale;
    thisobj.setCurrentTime(newTime);
    //thisobj.dragStart.style.left = distance+"px";
  }
  this.dragHelper.onDragEnd = function() {
    thisobj.timeline._userTime(thisobj.time);
  }

}
