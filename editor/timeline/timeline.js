module.exports = function() {
  var thisobj = this;

  //prototypes & includes
  this.log = require("./../../common/dp-log.js");
  this.Track = require("./tm-track.js");
  this.TrackItem = require("./tm-trackitem.js");
  this.TimeHandle = require("./tm-timehandle.js");
  this.Player = require("./../../player/modules/player-main.js");

  //--variables--//
  this._logName = "Timeline";
  this.scale = 1;
  this.previousScale = this.scale;
  this.scaleIndex = 0;
  this.duration = 10000;
  this.time = 0;
  this.tracks = [];
  this.timeHandle = null;

  //--elements--//
  //main container
  this.container = document.createElement("div");
  this.container.className = "drama-timeline-editor";
  this.container.style.cssText = "height:100%;"
  //time container
  this.timeContainer = document.createElement("div");
  this.timeContainer.className = "time-labels";
  this.timeContainer.style.cssText = "position:absolute;left:0;top:0;margin-left:5px;width:100%;z-index:2";
  this.container.appendChild(this.timeContainer);
  //scrollable area container
  this.scrollableContainer = document.createElement("div");
  this.scrollableContainer.className = "scrollable-area";
  this.scrollableContainer.style.cssText = "position:relative;width:100%;height:100%;margin-top:1.2em;overflow:scroll;"  ;
  this.container.appendChild(this.scrollableContainer);
  //grid container
  this.gridContainer = document.createElement("div");
  this.gridContainer.className = "grid";
  this.gridContainer.style.cssText = "position:absolute;width:100%;height:100%;";
  this.scrollableContainer.appendChild(this.gridContainer);
  //tracks container
  this.tracksContainer = document.createElement("div");
  this.tracksContainer.className = "tracks";
  this.tracksContainer.style.cssText = "position:absolute;top:0px;padding-top:2em;width:100%;height:100%;";
  this.scrollableContainer.appendChild(this.tracksContainer);

  //--functions--//
  this.setScale = function(scale) {
    this.scale = scale;
    this.timeHandle.setScale(scale);
    if(this.scale!=this.previousScale) {
      this._refreshGrid();
      this._refreshTracks();
      thisobj.scrollableContainer.scrollLeft = thisobj.scrollableContainer.scrollLeft*(this.scale/this.previousScale);
    }
    this.previousScale = scale;
  }

  this.setDuration = function(duration) {
    this.duration = duration;
    this._refreshGrid();
    this._refreshTracks();
  }

  this.setCurrentTime = function(time) {
    this.time = time;
    this.timeHandle.setCurrentTime(time);
  }

  this._userTime = function(time) {
    this.time = time;
    this.onusertime(time);
  }

  this.onusertime = function(time) {}

  this._refreshGrid = function() {
    this.timeContainer.innerHTML = "";
    this.gridContainer.innerHTML = "";
    var period = 100;
    if(this.scale<0.05) {period = 1000;}
    else if(this.scale<0.1) {period = 500;}
    else if(this.scale<0.5) {period = 200;}
    else if(this.scale<0.8) {period = 100;}
    else if(this.scale<1.25) {period = 50;}
    else if(this.scale<1.6) {period = 10;}
    else {period = 5;}

    var scaledDuration = this.duration*this.scale;
    var scaledPeriod = period*this.scale;
    var totalBars = Math.ceil(scaledDuration/scaledPeriod);
    for(var i=0;i<totalBars;i++) {
      //lines
      var line = document.createElement("div");
      line.style.cssText = "position:absolute;background-color:#333;width:1px;min-height:100%;top:0px;";
      line.style.left = i*scaledPeriod+"px";
      //labels
      if(i%5==0) {
        line.style.backgroundColor = "#633";
        var label = document.createElement("div");
        label.style.cssText = "position:absolute;top:0px;padding:2px 0;z-index:1;color:#777;";
        label.style.left = 2+i*scaledPeriod+"px";
        label.innerHTML = (i*period)|0;
        this.timeContainer.appendChild(label);
      }
      this.gridContainer.appendChild(line);
    }
  }

  this._refreshTracks = function() {
    for(var i=0; i<this.tracks.length;i++) {
      this.tracks[i].setScale(this.scale, false); //False means don't refresh. The track will be refreshed with the setDuration
      this.tracks[i].setDuration(this.duration);
    }
  }

  this._reheightGrid = function() {
    var total = 0;
    for(var i=0;i<this.tracks.length;i++) {
      var currentHeight = this.tracks[i]._getTotalLevels()*(this.tracks[i].itemHeight+this.tracks[i].itemVerticalMargin);
      total += currentHeight;
    }
    this.gridContainer.style.height = total+"em";
  }

  this.addTrack = function(track) {
    track.ontrackchange = function() {thisobj._reheightGrid();}
    this.tracks.push(track);
    this.tracksContainer.appendChild(track.container);
    track.setScale(this.scale);
  }

  this._setScaleIndex = function(newIndex) {
    this.scaleIndex = newIndex;
    if(this.scaleIndex>0.99) {this.scaleIndex = 0.99;}
    if(this.scaleIndex<-0.99) {this.scaleIndex = -0.99;}
    var newScale = (this.scaleIndex<1?this.scaleIndex+1:this.scaleIndex*2+1);
    this.setScale(newScale);
  }

  //--initialize--//
  this.timeHandle = new this.TimeHandle(this);

  this._setScaleIndex(-0.09*8);

  this.scrollableContainer.onscroll = function(event) {
    //console.log(event);
    thisobj.timeContainer.style.left = -thisobj.scrollableContainer.scrollLeft+"px"
    thisobj.timeHandle.setHorizontalOffset(thisobj.scrollableContainer.scrollLeft);
  }

  document.onkeydown = function(event) {
    // console.log(event.keyCode);
    if(event.keyCode==107) {
      //plus
      thisobj._setScaleIndex(thisobj.scaleIndex+0.09);
    } else if(event.keyCode==109) {
      //minus
      thisobj._setScaleIndex(thisobj.scaleIndex-0.09);
    }
  }

}
