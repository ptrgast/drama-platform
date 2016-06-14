module.exports = function() {
  var thisobj = this;

  //--prototypes--//
  this.log = require("./../../common/dp-log.js");
  this.TrackItem = require("./tm-trackitem.js");

  //--variables--//
  this._logName = "Track";
  this.scale = 1;
  this.duration = 10000; //msec
  this.trackItems = [];
  this.itemHeight = new this.TrackItem()._height;
  this.itemVerticalMargin = 0.2;

  //--elements--//
  this.container = document.createElement("div");
  this.container.className = "track";
  this.container.style.cssText = "position:relative;min-height:1.5em;border-bottom:1px dashed rgba(255,255,255,0.05)";
  this.container.style.cssText += "-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;";

  //--functions--//
  this.setScale = function(scale, refresh) {
    this.scale = scale;
    if(refresh!=false) {this._refresh();}
  }

  this.setDuration = function(duration, refresh) {
    this.duration = duration;
    if(refresh!=false) {this._refresh();}
  }

  this.addItem = function(item) {
    if(!(item instanceof this.TrackItem)) {this.log.error("Invalid track item!", this);}
    this.trackItems.push(item);
    this.container.appendChild(item.container);
    item.setScale(this.scale);
    this._sortItemsByStartTime();
    this._arrangeItems();
    this.ontrackchange();
  }

  this._sortItemsByStartTime = function() {
    this.trackItems.sort(function(a,b) {
      return a.time-b.time;
    });
  }

  //returns the overlapping region between two items
  this._overlap = function(item1, item2) {
    var startingLast = (item1.time>item2.time)?item1:item2;
    var endingFirst = (item1.getEndTime()<item2.getEndTime())?item1:item2;

    var overlap = {
      start:startingLast.time,
      end:endingFirst.getEndTime()
    };
    //console.log(item1._toString()+" "+item2._toString()+" ovlp["+overlap.start+","+overlap.end+"]");
    if(overlap.end-overlap.start>=0) {return overlap;}
    else {return null;}
  }

  this._calculateItemLevel = function(item) {
    var currentLevel=0;
    for(var i=0;i<this.trackItems.length;i++) {
      var currentItem = this.trackItems[i];
      if(currentItem!=item) {
        if(currentItem._level==currentLevel && this._overlap(currentItem,item)!=null) {
          currentLevel++;
          i=0;
        }
      }
    }
    item._level = currentLevel;
  }

  this._getTotalLevels = function() {
    var max=0;
    for(var i=0;i<this.trackItems.length;i++) {
      var currentItem = this.trackItems[i];
      max = Math.max(max, currentItem._level);
    }
    return max+1;
  }

  this._arrangeItems = function() {
    //reset levels
    for(var i=0;i<this.trackItems.length;i++) {this.trackItems[i]._level = -1;}
    for(var i=0;i<this.trackItems.length;i++) {
      var item = this.trackItems[i];
      this._calculateItemLevel(item);
      //console.log("level for "+item._toString()+" > "+item._level);
      item.container.style.top = (this.itemHeight+this.itemVerticalMargin)*item._level+"em";
    }
    //resize the track
    var trackHeight = this._getTotalLevels()*(this.itemHeight+this.itemVerticalMargin);
    this.container.style.height = trackHeight+"em";
  }

  this._refresh = function() {
    this.container.style.width = this.duration*this.scale+"px";
    for(var i=0;i<this.trackItems.length;i++) {
      this.trackItems[i].setScale(this.scale);
    }
  }

  this.ontrackchange = function() {}

  //--initialization--//
  this._refresh();
}
