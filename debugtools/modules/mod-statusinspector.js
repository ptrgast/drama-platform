 module.exports = function(player) {
  var thisobj = this;

  //--prototypes & includes--/
  this.log=require("./../../common/dp-log.js");

  //--variables--//
  this._logName = "StatusInspector";
  this.player = player;
  this._seekDifferencesTime = 0;

  //--functions--//
  this.findSeekDifferencesAt = function(time) {
    this._seekDifferencesTime = time;
    this.player.eventsManager.addListener("playbacktimechange", this._findSeekDifferencesListener);
    this.player.stop();
    this.player.play();
  }

  this.statusCompare = function(status1, status2) {
    var style = "body{padding:2em;font-family:sans-serif;} table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:1em;background:#f0f0f0;} table,td,th{text-align:left;border:1px solid #ddd;} td,th{padding:0.2em;} .different{background-color:#faa;color:#a00;}";
    var popup = this._createWindow("Status Comparison", style);
    var html = "";

    //for every drawqueue item
    html += "<h1>Draw Queue</h1>";
    html += "<table><tr><th>attribute</th><th>1</th><th>2</th></tr></table>";
    for(var i=0; i<Math.max(status1.drawQueue.length,status2.drawQueue.length); i++) {
      var item1 = (i<status1.drawQueue.length)?status1.drawQueue[i]:{};
      var item2 = (i<status2.drawQueue.length)?status2.drawQueue[i]:{};
      var diff = this._compareObjects(item1, item2);
      html += "<table>";
      html += "<tr><td colspan='3'>index: "+i+"</td></tr>";
      html += diff.html;
      html += "</table>";
    }

    //for every actor
    html += "<h1>Actors</h1>";
    html += "<table><tr><th>attribute</th><th>1</th><th>2</th></tr></table>";
    for(var i=0; i<Math.max(status1.actors.length, status2.actors.length); i++) {
      var actor1 = (i<status1.actors.length)?status1.actors[i]:{};
      var actor2 = (i<status2.actors.length)?status2.actors[i]:{};
      var diff = this._compareObjects(actor1, actor2);
      html += "<table>";
      html += "<tr><td colspan='3'>index: "+i+"</td></tr>";
      html += diff.html;
      html += "</table>";
    }

    //for every audiotrack
    html += "<h1>Audiotracks</h1>";
    html += "<table><tr><th>attribute</th><th>1</th><th>2</th></tr></table>";
    for(var i=0; i<Math.max(status1.audiotracks.length, status2.audiotracks.length); i++) {
      var audiotrack1 = (i<status1.audiotracks.length)?status1.audiotracks[i]:{};
      var audiotrack2 = (i<status2.audiotracks.length)?status2.audiotracks[i]:{};
      var diff = this._compareObjects(audiotrack1, audiotrack2);
      html += "<table>";
      html += "<tr><td colspan='3'>index: "+i+"</td></tr>";
      html += diff.html;
      html += "</table>";
    }

    popup.document.body.innerHTML = html;
  }

  this._copyObject = function(obj) {
    var json = JSON.stringify(obj);
    return JSON.parse(json);
  }

  this._compareObjects = function(obj1, obj2) {
    var output = {
      foundDifferences: false,
      html: ""
    };
    var totalKeys1 = 0;
    var totalKeys2 = 0;
    var biggerObject = obj1;
    for(var key in obj1) {totalKeys1++;}
    for(var key in obj2) {totalKeys2++;}
    if(totalKeys2>totalKeys1) {biggerObject = obj2;}
    for(var key in biggerObject) {
      if(typeof obj1[key]=="undefined" || typeof obj2[key]=="undefined" || obj1[key]!=obj2[key]) {
        output.foundDifferences = true;
        output.html += "<tr class='different'>";
      } else {
        output.html += "<tr>";
      }
      output.html += "<td>"+key+"</td><td>"+obj1[key]+"</td><td>"+obj2[key]+"</td>";
      output.html += "</tr>";
    }
    //this.log.message("", this);

    return output;
  }

  this._lendAttributes = function(fromObj, toObj, attrs) {
    for(var i=0; i<attrs.length; i++) {
      var attribute = attrs[i];
      toObj[attribute] = fromObj[attribute];
    }
  }

  this._composeCurrentStatus = function() {
    if(!this.player.story.isLoaded()) {
      this.log.error("Story not loaded!", this);
    }

    var drawQueue = this.player.drawQueue;
    var story = this.player.story;
    var currentStatus = {};
    currentStatus.drawQueue = [];
    currentStatus.actors = [];
    currentStatus.audiotracks = [];

    //drawQueue
    for(var i=0; i<drawQueue.items.length; i++) {
      var item = drawQueue.items[i];
      var strippedItem = {};
      this._lendAttributes(item, strippedItem, ["name"]);
      currentStatus.drawQueue.push(strippedItem);
    }

    //actors
    for(var i=0; i<story.actors.length; i++) {
      var actor = story.actors[i];
      var strippedActor = {};
      this._lendAttributes(actor, strippedActor, ["name","x","y","z"]);
      currentStatus.actors.push(strippedActor);
    }

    //actors add actions
    for(var i=0; i<story.actors.length; i++) {
      var actor = story.actors[i];
      var strippedActor = currentStatus.actors[i];
      strippedActor.action_type = (typeof actor.action!="undefined" && actor.action!=null)?actor.action.type:"null";
    }

    //audiotracks
    for(var i=0; i<story.audiotracks.length; i++) {
      var audiotrack = story.audiotracks[i];
      var strippedAudiotrack = {};
      this._lendAttributes(audiotrack, strippedAudiotrack, ["_name","_active","_paused","_volume"]);
      currentStatus.audiotracks.push(strippedAudiotrack);
    }

    return currentStatus;
  }

  this._findSeekDifferencesListener = function(currentTime) {
    if(currentTime>thisobj._seekDifferencesTime) {
      thisobj.player.eventsManager.removeListener("playbacktimechange", thisobj._findSeekDifferencesListener);
      thisobj.player.pause(); //don't stop here because the drawqueue will become empty
      var status1 = thisobj._copyObject(thisobj._composeCurrentStatus());
      thisobj.player.stop();
      thisobj.player.seek(thisobj._seekDifferencesTime);
      var status2 = thisobj._copyObject(thisobj._composeCurrentStatus());
      thisobj.statusCompare(status1, status2);
    }
  }

  this._createWindow = function(title, stylesheet) {
    var popup = window.open("", null, "width=800,height=600,scrollbars=yes");
    if(title!=null) {popup.document.title = title;}
    if(stylesheet!=null) {
      var styleElem = popup.document.createElement("style");
      styleElem.type = "text/css";
      styleElem.textContent = stylesheet;
      popup.document.head.appendChild(styleElem);
    }
    popup.document.body.innerHTML = "";
    return popup;
  }

}
