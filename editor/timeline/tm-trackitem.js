module.exports = function(track) {
  var thisobj = this;

  //--prototypes--//
  this.log = require("./../../common/dp-log.js");
  this.DragHelper = require("./tm-draghelper.js");

  //--variables--//
  this._logName = "TrackItem";
  this.track = track;
  this.scale = 1;
  this.time = 0;
  this.duration = 0;
  this.name = "";
  this._level = -1; //determines the y position of the item on the track
  this._height = 1.5;

  //--elements--//
  this.container = document.createElement("div");
  this.container.className = "item";
  this.container.style.cssText = "position:absolute;background-color:#AADDCF;cursor:move;";
  this.container.style.height = this._height+"em";
  this.container.style.lineHeight = this._height+"em";
  this.trackLabel = document.createElement("div");
  this.trackLabel.style.cssText = "position:absolute;background-color:rgba(170,221,207,0.4);padding:0 0.5em;white-space:nowrap;";
  this.trackLabel.textContent = this.name;
  this.container.appendChild(this.trackLabel);
  this.leftHandle = document.createElement("div");
  this.leftHandle.style.cssText = "position:absolute;left:-2px;top:0;width:4px;height:100%;border:1px solid #87A99F;background-color:#99CCBE;cursor: ew-resize;z-index:2";
  this.container.appendChild(this.leftHandle);
  this.rightHandle = document.createElement("div");
  this.rightHandle.style.cssText = "position:absolute;right:-2px;top:0;width:4px;height:100%;border:1px solid #87A99F;background-color:#99CCBE;cursor: ew-resize;z-index:2";
  this.container.appendChild(this.rightHandle);

  //--click & drag--//
  this.dragStartTime = null;
  this.dragStartDuration = null;
  this.leftHandleDragHelper = null;
  this.rightHandleDragHelper = null;
  this.moveDragHelper = null;

  if(this.track!=null) {
    this.leftHandleDragHelper = new this.DragHelper(this.leftHandle, this.track.container);
    this.rightHandleDragHelper = new this.DragHelper(this.rightHandle, this.track.container);
    this.moveDragHelper = new this.DragHelper(this.container, this.track.container);

    this.moveDragHelper.onDragStart =
    this.rightHandleDragHelper.onDragStart =
    this.leftHandleDragHelper.onDragStart = function() {
      if(thisobj.dragStartTime!=null || thisobj.dragStartDuration!=null) {return false; /*Already dragging something! Cancel this drag.*/}
      thisobj.dragStartTime = thisobj.time;
      thisobj.dragStartDuration = thisobj.duration;
    }

    this.moveDragHelper.onDragEnd =
    this.rightHandleDragHelper.onDragEnd =
    this.leftHandleDragHelper.onDragEnd = function() {
      thisobj.dragStartTime = null;
      thisobj.dragStartDuration = null;
      thisobj.track._sortItemsByStartTime();
      thisobj.track._arrangeItems();
    }

    this.leftHandleDragHelper.onDrag = function(distance) {
      var newTime = thisobj.dragStartTime+(distance/thisobj.scale);
      var newDuration = thisobj.dragStartDuration-(distance/thisobj.scale);
      if(newDuration<0) {newDuration = 0;}
      thisobj.setDuration(newDuration);
      thisobj.setTime(newTime);
    }

    this.rightHandleDragHelper.onDrag = function(distance) {
      var newDuration = thisobj.dragStartDuration+(distance/thisobj.scale);
      if(newDuration<0) {newDuration = 0;}
      thisobj.setDuration(newDuration);
    }

    this.moveDragHelper.onDrag = function(distance) {
      var newTime = thisobj.dragStartTime+(distance/thisobj.scale);
      thisobj.setTime(newTime);
    }
  }

  //--functions--//
  this.setScale = function(scale) {
    this.scale = scale;
    this._refresh();
  }

  this.setName = function(name) {
    this.name = name;
    this.trackLabel.textContent = this.name;
  }

  this.setTime = function(time) {
    this.time = time*1;
    this._refresh();
  }

  this.setDuration = function(duration) {
    this.duration = duration*1;
    this._refresh();
  }

  this.getEndTime = function() {
    return this.time+this.duration;
  }

  this._refresh = function() {
    this.container.style.left = this.time*this.scale+"px";
    this.container.style.width = this.duration*this.scale+"px";
  }

  this._toString = function() {
    return "item["+this.time+","+this.duration+"]";
  }
}
