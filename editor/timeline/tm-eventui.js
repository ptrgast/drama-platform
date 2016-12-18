module.exports = function(timeline, timelineEvent, label) {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._DragInParentHelper = require("./tm-draghelper.js");

  //--Variables--//

  this._editable = true;
  this._timeline = timeline;
  this._timelineEvent = timelineEvent;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "event";
  this._container.style.position = "absolute";
  this._container.style.marginLeft = timeline._timeToX(timelineEvent.startTime)+"px";
  //container > label-container
  this._labelContainer = document.createElement("div");
  this._labelContainer.style.cssText = "position:relative;z-index:1;padding-left:0.5em";
  this._container.appendChild(this._labelContainer);
  //container > label > text-span
  this._labelElem = document.createElement("div");
  this._labelElem.className = "label";
  this._labelElem.style.cssText = "display:inline-block;cursor:move";
  this._labelElem.innerHTML = label;
  this._labelContainer.appendChild(this._labelElem);
  //container > duration
  this._durationElem = document.createElement("div");
  this._durationElem.className = "duration";
  this._container.appendChild(this._durationElem);
  //container > leftHandle
  this._leftHandleElem = document.createElement("div");
  this._leftHandleElem.className = "handle";
  this._leftHandleElem.style.cssText = "position:absolute;width:5px;z-index:2;cursor:ew-resize";
  this._container.appendChild(this._leftHandleElem);
  //container > rightHandle
  this._rightHandleElem = document.createElement("div");
  this._rightHandleElem.className = "handle";
  this._rightHandleElem.style.cssText = "position:absolute;width:5px;z-index:2;cursor:ew-resize";
  this._container.appendChild(this._rightHandleElem);

  //--Functions--//

  this._destruct = function() {
    this._leftHandleDH._destruct();
    this._rightHandleDH._destruct();
    this._moveDH._destruct();
  }

  //Start Time
  this._dragStartTime = 0;
  this._onLeftHandleDrag = function(dragEvent) {
    if(dragEvent.started) {
      this._dragStartTime = this._timelineEvent.startTime;
    } else if(!dragEvent.ended) {
      var newStartTime = (dragEvent.dx*timeline._viewportResolution/timeline._viewportScale)|0;
      if(this._dragStartTime+newStartTime<this._timelineEvent.endTime) {
        if(this._dragStartTime+newStartTime<0) {
          this._timelineEvent.startTime = 0;
        } else {
          this._timelineEvent.startTime = this._dragStartTime+newStartTime;
        }
        this.refresh();
      }
    } else {
      this._timeline.eventsManager.callHandlers("eventchange", this._timelineEvent);
      this._dragStartTime = 0;
    }
  }
  this._leftHandleDH = new this._DragInParentHelper(this._leftHandleElem, timeline._eventsContainer, function(dragEvent) {thisobj._onLeftHandleDrag(dragEvent)});

  //End Time
  this._dragEndTime = 0;
  this._onRightHandleDrag = function(dragEvent) {
    if(dragEvent.started) {
      this._dragEndTime = this._timelineEvent.endTime;
    } else if(!dragEvent.ended) {
      var newEndTime = (dragEvent.dx*timeline._viewportResolution/timeline._viewportScale)|0;
      if(this._dragEndTime+newEndTime>this._timelineEvent.startTime) {
        this._timelineEvent.endTime = this._dragEndTime+newEndTime;
        this.refresh();
      }
    } else {
      this._timeline.eventsManager.callHandlers("eventchange", this._timelineEvent);
      this._dragEndTime = 0;
    }
  }
  this._rightHandleDH = new this._DragInParentHelper(this._rightHandleElem, timeline._eventsContainer, function(dragEvent) {thisobj._onRightHandleDrag(dragEvent)});

  //Move
  this._onMoveEvent = function(dragEvent) {
    if(dragEvent.started) {
      this._dragStartTime = this._timelineEvent.startTime;
    } else if(!dragEvent.ended) {
      var duration = timelineEvent.endTime>timelineEvent.startTime?timelineEvent.endTime-timelineEvent.startTime:0;
      var newStartTime = (dragEvent.dx*timeline._viewportResolution/timeline._viewportScale)|0;
      if(this._dragStartTime+newStartTime<0) {
        this._timelineEvent.startTime = 0;
        this._timelineEvent.endTime = this._timelineEvent.startTime+duration;
      } else {
        this._timelineEvent.startTime = this._dragStartTime+newStartTime;
        this._timelineEvent.endTime = this._timelineEvent.startTime+duration;
      }
        this.refresh();
    } else {
      this._timeline.eventsManager.callHandlers("eventchange", this._timelineEvent);
      this._dragStartTime = 0;
    }
  }
  this._moveDH = new this._DragInParentHelper(this._labelElem, timeline._eventsContainer, function(dragEvent) {thisobj._onMoveEvent(dragEvent)});

  //Double click
  this._onDoubleClick = function(event) {
    thisobj._timeline.eventsManager.callHandlers("eventdoubleclick", thisobj._timelineEvent);
  }
  this._container.addEventListener("dblclick", this._onDoubleClick);

  this.refresh = function() {
    this._container.style.marginLeft = timeline._timeToX(this._timelineEvent.startTime)+"px";
    var duration = timelineEvent.endTime>timelineEvent.startTime?timeline._timeToX(timelineEvent.endTime)-timeline._timeToX(timelineEvent.startTime):0;
    this._durationElem.style.position = "absolute";
    this._durationElem.style.zIndex = "0";
    this._durationElem.style.top = "0";
    this._durationElem.style.bottom = "0";
    this._durationElem.style.width = duration+"px";
    //left handle
    this._leftHandleElem.style.top = "0";
    this._leftHandleElem.style.bottom = "0";
    this._leftHandleElem.style.left = "-2px";
    //right handle
    this._rightHandleElem.style.top = "0";
    this._rightHandleElem.style.bottom = "0";
    this._rightHandleElem.style.left = duration-2+"px";
  }

  this.refresh();

}
