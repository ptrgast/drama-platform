module.exports = function(container) {

  var thisobj = this;

  //--prototypes & includes--//

  this._EventUI = require("./tm-eventui.js");
  this._TimeIndicator = require("./tm-timeindicator.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this._items = [];
  this._viewportStartTime = 0;
  this._viewportResolution = 2; //msec per pixel
  this._viewportScale = 1.0;
  this._groupLabelsWidth = 120;
  this._currentTime = 0;
  this.eventsManager=new this._EventsManager();

  //--Elements--//

  this._container = (container==null || typeof container=="undefined")?document.createElement("div"):container;
  this._container.className = "timeline-editor";
  this._container.style.cssText = "position:relative;overflow:hidden"+
                                  "-webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;";
  //container > guides
  this._guidesContainer = document.createElement("div");
  this._guidesContainer.className = "guides-container";
  this._guidesContainer.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;width:100%;height:100%;margin-left:"+this._groupLabelsWidth+"px;user-select:none";
  this._container.appendChild(this._guidesContainer);
  //container > events
  this._eventsContainer = document.createElement("div");
  this._eventsContainer.style.cssText = "position:absolute;overflow:hidden;margin-top:1.5em;top:0left:0;width:100%;padding-left:"+this._groupLabelsWidth+"px;user-select:none";
  this._container.appendChild(this._eventsContainer);
  //container > groups cover
  this._groupsCover = document.createElement("div");
  this._groupsCover.className = "groups-cover";
  this._groupsCover.style.cssText = "position:absolute;top:0;left:0;width:"+this._groupLabelsWidth+"px;min-height:100%;z-index:4";
  this._container.appendChild(this._groupsCover);
  //container > time indicator
  this._timeIndicator = new this._TimeIndicator(this);
  this._container.appendChild(this._timeIndicator._container);

  //--Functions--//

  this.getContainer = function() {
    return this._container;
  }

  this.addItem = function(id, group, name, startTime, endTime) {
    if(typeof id=="undefined") {id = null;}
    if(typeof group=="undefined") {group = null;}
    if(typeof name=="undefined") {name = null;}
    if(typeof startTime=="undefined") {startTime = null;}
    if(typeof endTime=="undefined") {endTime = null;}
    var newItem = {};
    newItem.id = id;
    newItem.group = group;
    newItem.name = name;
    newItem.startTime = startTime;
    newItem.endTime = endTime;
    this._items.push(newItem);
  }

  this.renameItem = function(id, name) {
    for(var i=0; i<this._UIItems.length; i++) {
      if(this._UIItems[i]._timelineEvent.id==id) {
        this._UIItems[i]._timelineEvent.name = name;
        this._UIItems[i]._labelElem.innerHTML = name;
        return;
      }
    }
  }

  this.deleteItem = function(id) {
    for(var i=0; i<this._UIItems.length; i++) {
      if(this._UIItems[i]._timelineEvent.id==id) {
        this._UIItems[i]._container.remove();
        this._UIItems.splice(i,1);
        break;
      }
    }
    for(var i=0; i<this._items.length; i++) {
      if(this._items[i].id==id) {
        this._items.splice(i,1);
        break;
      }
    }
  }

  this.renameGroup = function(group, newName) {
    var items = this._getGroupItems(group);
    for(var i=0; i<items.length; i++) {
      items[i].group = newName;
    }
    this._inflateGroups();
  }

  this.deleteGroup = function(group) {
    var items = this._getGroupItems(group);
    for(var i=0; i<items.length; i++) {
      this.deleteItem(items[i].id);
    }
    this._inflateGroups();
  }

  this.clear = function() {
    this._items.length = 0;
    this._render();
  }

  this._getGroups = function() {
    var groups = [];
    for(var i=0; i<this._items.length; i++) {
      var alreadyIn = false;
      for(var g=0; g<groups.length; g++) {
        if(this._items[i].group==groups[g]) {
          alreadyIn = true;
          break;
        }
      }
      if(!alreadyIn) {groups.push(this._items[i].group);}
    }
    return groups;
  }

  this._getGroupItems = function(group) {
    var groupItems = [];
    for(var i=0; i<this._items.length; i++) {
      if(this._items[i].group==group) {
        groupItems.push(this._items[i]);
      }
    }
    return groupItems;
  }

  this._getGroupItemsInPeriod = function(group, startTime, endTime) {
    var passZone = 100; //20ms
    var groupItems = this._getGroupItems(group);
    var output = [];
    for(var i=0;i<groupItems.length;i++) {
      var eventStartTime = (groupItems[i].startTime)!=null?groupItems[i].startTime:0;
      var eventEndTime = (groupItems[i].endTime)!=null?groupItems[i].endTime:eventStartTime;
      if(
          (eventStartTime>=startTime-passZone && eventStartTime<=endTime+passZone) ||
          (eventEndTime>=startTime-passZone && eventEndTime<=endTime+passZone) ||
          (eventStartTime<=startTime && eventEndTime>=endTime)
        ) {
        //console.log("Adding item "+i+" with startTime:"+eventStartTime+" and endTime:"+eventEndTime+" | "+startTime+"-"+endTime);
        output.push(groupItems[i]);
      }
    }
    return output;
  }

  this._getGuidesPeriod = function(timeRange) {
    var ranges = [200, 1000, 2000, 10000, 20000, 100000];
    var periods = [10, 50, 100, 500, 1000, 5000, 10000];
    for(var i=0; i<ranges.length; i++) {
      if(timeRange<=ranges[i]) {return periods[i];}
    }
    //The given range is above the predefined ranges so return the last period
    return periods[periods.length-1];
  }

  this._timeToX = function(time) {
    return (time-this._viewportStartTime)/this._viewportResolution*this._viewportScale;
  }

  this._dragStartTime = 0;
  this._dragStartY = 0;
  this._onDrag = function(dragEvent) {
      //console.log(dragEvent.dx+","+dragEvent.dy+" "+dragEvent.ended);
      if(dragEvent.started) {
        this._dragStartTime = this._viewportStartTime;
        var top = this._eventsContainer.style.top;
        this._dragStartY = top.substr(-2)=="px"?top.substr(0,top.length-2)*1:0;
      } else if(dragEvent.ended) {

      } else {
        this._viewportStartTime = this._dragStartTime-(dragEvent.dx*this._viewportResolution/this._viewportScale);
        if(this._viewportStartTime<0) {this._viewportStartTime=0;}
        this._render();

        var newY = this._dragStartY+dragEvent.dy;
        if(newY>0) {newY = 0;}
        this._eventsContainer.style.top = newY+"px";
      }
      // console.log(dragEvent.dy, newY, top);
  }
  new _TimelineDragHelper(this._container, function(dragEvent){thisobj._onDrag(dragEvent);});

  this._onWheel = function(wheelEvent) {
    if(wheelEvent.deltaY>0) { //zoom out
      this._viewportScale -= 0.02;
    } else { //zoom in
      this._viewportScale += 0.02;
    }
    if(this._viewportScale<0.02) {this._viewportScale=0.02};
    this._render();
  }
  this._container.addEventListener("wheel", function(wheelEvent) {thisobj._onWheel(wheelEvent)});

  this._UIItems = [];
  this._render = function() {
    //clear previous
    this._guidesContainer.innerHTML = "";
    //for(var i=0; i<this._UIItems.length; i++) {this._UIItems[i]._destruct();}
    //this.UIITems = [];

    //variables
    var viewportWidth = this._eventsContainer.clientWidth;
    var startTime = this._viewportStartTime;
    var endTime = startTime+(viewportWidth*this._viewportResolution)/this._viewportScale;
    var timeRange = endTime-startTime;
    var groups = this._getGroups();
    var guidesPeriod = this._getGuidesPeriod(timeRange);
    var guidesStart = startTime-startTime%guidesPeriod;
    var guidesOffset = -(startTime%guidesPeriod)/this._viewportResolution*this._viewportScale;
    // console.log("Rendering from "+startTime+" to "+endTime+" (range: "+timeRange+") - "+groups.length+" groups");

    //add guides
    var currentGuideTime = guidesStart;
    while(currentGuideTime<endTime) {
      var x = this._timeToX(currentGuideTime)+"px";
      //guide
      var guideElem = document.createElement("div");
      guideElem.className = "guide";
      guideElem.style.cssText = "position:absolute;width:1px;top:0px;bottom:0px";
      guideElem.style.left = x;
      this._guidesContainer.appendChild(guideElem);
      //label
      var labelElem = document.createElement("div");
      labelElem.className = "label";
      labelElem.style.cssText = "position:absolute;top:0px;";
      labelElem.style.left = x;
      var labelTime = currentGuideTime;
      if(labelTime<1000) {labelTime = labelTime+"ms";}
      else {labelTime = ((labelTime/1000)*10|0)/10+"sec"}
      labelElem.innerHTML = labelTime;
      this._guidesContainer.appendChild(labelElem);

      currentGuideTime += guidesPeriod;
    }

    //refresh timeline events
    for(var i=0; i<this._UIItems.length; i++) {
      this._UIItems[i].refresh();
    }

    //refresh the time indicator
    this._timeIndicator.refresh();

  }

  this._inflateGroups = function() {
    var tmpGroups = this._eventsContainer.getElementsByClassName("group");
    for(var i=0; i<tmpGroups.length; i++) {
      tmpGroups[i].removeEventListener("dblclick", this._onGroupDoubleClick);
      tmpGroups[i].remove();
    }
    this._eventsContainer.innerHTML = "";

    var groups = this._getGroups();

    var addGroupLink = document.createElement("a");
    addGroupLink.innerHTML = "(+) Add&hellip;";
    addGroupLink.style.cssText = "display:block;background-color:#333;color:white;text-align:center";
    addGroupLink.setAttribute("href", "javascript:");
    addGroupLink.onclick = function() {thisobj.eventsManager.callHandlers("addtimelinegroup");}
    groups.push(addGroupLink);

    //add groups
    for(var i=0;i<groups.length;i++) {
      var groupElem = document.createElement("div");
      groupElem.className = "group";
      groupElem.style.cssText = "position:relative;min-height:1.2em";
      groupElem.groupName = groups[i];
      if(typeof groups[i]=="string") {
        groupElem.addEventListener("dblclick", this._onGroupDoubleClick);
      }

      //add group label
      var groupLabel = document.createElement("div");
      groupLabel.className = "group-label";
      groupLabel.style.cssText = "position:absolute;top:0;left:"+(-this._groupLabelsWidth)+"px;width:"+this._groupLabelsWidth+"px;z-index:5";
      if(typeof groups[i]=="object") {
        groupLabel.appendChild(groups[i]);
      } else {
        groupLabel.innerHTML = "&nbsp;&nbsp;"+groups[i];
      }
      groupElem.appendChild(groupLabel);

      //add events
      // var groupEvents = this._getGroupItemsInPeriod(groups[i], startTime, endTime);
      var groupEvents = this._getGroupItems(groups[i]);
      for(var e=0; e<groupEvents.length; e++) {
        var currentEvent = groupEvents[e];
        var eventUI = new thisobj._EventUI(thisobj, currentEvent, currentEvent.name);
        this._UIItems.push(eventUI);
        groupElem.appendChild(eventUI._container);
      }

      this._eventsContainer.appendChild(groupElem);
    }

  }

  this._onGroupDoubleClick = function(event) {
    //console.log(this.groupName, clickTime);
    event.stopPropagation();
    var clickTime = thisobj._viewportStartTime+(event.clientX-thisobj._groupLabelsWidth)/thisobj._viewportScale*thisobj._viewportResolution;
    thisobj.eventsManager.callHandlers("addevent", {group:this.groupName, time:clickTime});
  }

  this.setCurrentTime = function(newTime) {
    this._currentTime = newTime;
    var viewportWidth = this._eventsContainer.clientWidth;
    var startTime = this._viewportStartTime;
    var endTime = startTime+(viewportWidth*this._viewportResolution)/this._viewportScale;
    var groupLabelsOffset = this._groupLabelsWidth*this._viewportResolution/this._viewportScale
    if(this._currentTime+groupLabelsOffset>endTime || this._currentTime<startTime) {
      this._viewportStartTime = this._currentTime;
      this._render();
    }
    this._timeIndicator.refresh();
  }

  this._onTimeIndicatorDrag = function() {
    this.eventsManager.callHandlers("currenttimechange", this._currentTime);
  }
  this._timeIndicator.onDrag = function() {thisobj._onTimeIndicatorDrag();}

}

function _TimelineDragHelper(element, onDrag) {

  //--Variables--//
  var thisobj = this;
  this._startEvent = null;

  element.addEventListener("mousedown", function(event){thisobj._onMouseDown(event);});
  element.addEventListener("mousemove", function(event){thisobj._onMouseMove(event);});
  element.addEventListener("mouseup", function(event){thisobj._onMouseUp(event);});

  //--Functions--//

  this._onMouseDown = function(event) {
    event.stopPropagation();
    this._startEvent = event;
    var dragEvent = {
      dx:0,
      dy:0,
      started:true,
      ended:false
    };
    onDrag(dragEvent);
  }

  this._onMouseMove = function(event) {
    if(this._startEvent!=null && event.buttons==1) {
      event.stopPropagation();
      var dragEvent = {
        dx:event.clientX-this._startEvent.clientX,
        dy:event.clientY-this._startEvent.clientY,
        started:false,
        ended:false
      };
      onDrag(dragEvent);
    }
  }

  this._onMouseUp = function(event) {
    if(this._startEvent!=null) {
      event.stopPropagation();
      this._startEvent = null;
      var dragEvent = {
        dx:0,
        dy:0,
        started:false,
        ended:true
      };
      onDrag(dragEvent);
    }
  }

}
