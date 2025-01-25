(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//////////// AudioTrack ////////////
module.exports = function(trackInfo, onload, assetsPath) {
  var thisobj=this;
  this._origin = trackInfo;
  this._name="";
  this._volume=1;
  this._assetsPath=(typeof assetsPath=="undefined")?"":assetsPath;
  this._active=false;
  this._paused=false;
  this._audioElement=document.createElement("audio");
  this._ready=false;

  this.onPlaybackEnd=function() {
    thisobj._active = false;
    thisobj._paused = false;
  }

  this._init=function() {
    //get track info
    if(typeof trackInfo.name!="undefined") {this._name=trackInfo.name;}
    if(typeof trackInfo.volume!="undefined") {this._volume=trackInfo.volume;}
    if(trackInfo.url instanceof Array){
      for(i=0;i<trackInfo.url.length;i++) {
        var source=document.createElement("source");
        source.setAttribute("src",this._assetsPath+trackInfo.url[i]);
        source.setAttribute("type",getContentType(trackInfo.url[i]));
        this._audioElement.appendChild(source);
      }
    } else {
      this._audioElement.setAttribute("src",this._assetsPath+trackInfo.url);
    }

    //load track
    this._audioElement.addEventListener("canplaythrough",this._onTrackReady);
    this._audioElement.addEventListener("ended",this.onPlaybackEnd);
    this._audioElement.load();
    this._audioElement.volume=0;
  }

  this._onTrackReady=function() {
    if(!thisobj._ready) {
      thisobj._ready = true;
      onload();
    }
  }

  this.getName = function() {
    return this._name;
  }

  this.setVolume = function(volume) {
    this._audioElement.volume=this._volume*volume;
  }

  this.play = function() {
    if(!this._ready) {return;} //not ready to play
    this._active = true;
    this._paused = false;
    this._audioElement.play();
  }

  this.pause = function() {
    if(this._active) {this._paused = true;}
    this._audioElement.pause();
  }

  this.stop = function() {
    if(this._active) {this._audioElement.pause();}
    this._audioElement.load();
    this._active = false;
    this._paused = false;
  }

  this.getDuration = function() {
    return this._audioElement.duration*1000; //convert to msec
  }

  /** This function may not work **/
  this.seek = function(newTime) {
    newTime = newTime/1000; //convert to seconds
    this._audioElement.currentTime = newTime;
  }

  this.isActive = function() {
    return this._active;
  }

  this.isPaused = function() {
    return this._paused;
  }

  this._init();
}

function getContentType(file) {
  var extension=file.substring(file.lastIndexOf(".")+1,file.length);
  if(extension=="wav") {return "audio/wav";}
  else if(extension=="mp3") {return "audio/mpeg";}
  else if(extension=="ogg") {return "audio/ogg";}
}

},{}],2:[function(require,module,exports){
module.exports = function() {

  var thisobj=this;
  this.listeners=[];

  this.addListener=function(event,handler) {
    //check that this handler is not already registered
    if(this._findListener(event,handler)<0) {
      var listener=new Listener(event,handler);
      this.listeners.push(listener);
    }
  }

  this.removeListener=function(event,handler) {
    var i=this._findListener(event,handler);
    if(i>=0) {
      this.listeners.splice(i,1);
    }
  }

  this.callHandlers=function(event,params) {
    for(var i=0;i<this.listeners.length;i++) {
      var currentListener=this.listeners[i];
      if(currentListener.event==event) {
        if(typeof params=="undefined") {
          currentListener.handler();
        } else {
          currentListener.handler(params);
        }
      }
    }
  }

  this._findListener=function(event,handler) {
    for(var i=0;i<this.listeners.length;i++) {
      var currentListener=this.listeners[i];
      if(currentListener.handler==handler && currentListener.event==event) {
        return i;
      }
    }
    return -1;
  }

}

function Listener(event, handler) {
  this.event=event;
  this.handler=handler;
}

},{}],3:[function(require,module,exports){
//Log
module.exports = {
  ALL:0,
  WARNINGS_ERRORS:1,
  ERRORS:2,
  verbose:0,
  _prepend:"Drama",
  _keep:false,
  _buffer:[],

  message:function(text, source) {
    if(this.verbose==this.ALL) {
      var prepend=(typeof this._prepend!="undefined")?this._prepend+"> ":"";
      if(typeof source=="object" && typeof source._logName=="string") {prepend+=source._logName;}
      prepend+=": ";
      if(!this._keep) {console.log(prepend+text);}
      else {this._buffer.push({action:this.message, text:text, source:source});}
    }
  },
  warning:function(text, source) {
    if(this.verbose==this.ALL||this.verbose==this.WARNINGS_ERRORS) {
      var prepend=(typeof this._prepend!="undefined")?this._prepend+"> ":"";
      if(typeof source=="object" && typeof source._logName=="string") {prepend+=source._logName;}
      prepend+=": ";
      if(!this._keep) {console.warn(prepend+text);}
      else {this._buffer.push({action:this.warning, text:text, source:source});}
    }
  },
  error:function(text, source) {
    if(this.verbose==this.ALL||this.verbose==this.ERRORS) {
      var prepend=(typeof this._prepend!="undefined")?this._prepend+"> ":"";
      if(typeof source=="object" && typeof source._logName=="string") {prepend+=source._logName;}
      prepend+=": ";
      if(!this._keep) {console.error(prepend+text);}
      else {this._buffer.push({action:this.error, text:text, source:source});}
    }
  },

  keep:function(keep) {
    if(keep!=true) {
      keep=false;
      this.clearBuffer();
    }
    this._keep = keep;
  },
  clearBuffer:function() {
    this._buffer = [];
  },
  flush:function() {
    for(var i=0;i<this._buffer.length;i++) {
      var current = this._buffer[i];
      current.action(current.text, current.source);
    }
    this.clearBuffer();
  }
};

},{}],4:[function(require,module,exports){
module.exports = function(defaultOptions, userOptions) {

  var thisobj = this;

  this.defaultOptions = (defaultOptions==null)?{}:defaultOptions;
  this.userOptions = (userOptions==null)?{}:userOptions;

  this.get = function(param) {
    if(typeof this.userOptions[param]=="undefined") {
      if(typeof this.defaultOptions[param]=="undefined") {
        return null;
      } else {
        return this.defaultOptions[param];
      }
    } else {
      return this.userOptions[param];
    }
  }

}

},{}],5:[function(require,module,exports){
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
        //console.log("Resized element", current.element, current.element.onresize);
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

},{}],6:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;
  this.STATUS_NOT_LOADED = 0;
  this.STATUS_LOADING = 1;
  this.STATUS_LOADED = 2;

  this.log = require("./mod-log.js");
  this.AudioTrack = require("./mod-audiotrack.js");
  this._logName = "Story";
  this._status = this.STATUS_NOT_LOADED;
  this._storyURL = null;
  this._baseURL = null;
  this._loadCounter = 0;
  this._totalAssets = 0;

  this.format = null;
  this.title = "Untitled";
  this.width = 0;
  this.height = 0;
  this.actors = [];
  this.audiotracks = [];
  this.timeline = [];
  this.languages = [];

  //Create the system actors
  this.trigger=new MovableObject().initWithZ("trigger",9997);
  this.stagecurtain=new MovableObject().initWithZ("stagecurtain",9998);
  this.viewport=new MovableObject().initWithZ("viewport",9999);

  /** Loads a story from a URL. If you provide a baseURL it will be used as a
  base to every relative URL in the story including the story URL  **/
  this.load=function(url, baseURL) {
    //Check that this story is still intact
    if(this._status!=this.STATUS_NOT_LOADED) {
      this.log.error("This story object is already loaded or is still loading!", this);
      return;
    }

    //If nothing is provided then there is nothing to do here
    if(typeof url=='undefined') {
      this.log.error("You called load() without providing a story url!", this);
      return;
    }

    this.log.message("Loading "+url+"...", this);
    this._status=this.STATUS_LOADING;
    this._storyURL = url;
    if(typeof baseURL!="undefined") {this._baseURL=baseURL;}
    var request=new XMLHttpRequest();
    request.open("GET",this.addBaseToURL(url, baseURL));

    //handle response
    request.addEventListener("load",function() {
      var response;
      try {
        response=JSON.parse(this.responseText);
      } catch(ex) {
        thisobj.log.error("Failed to parse story!", this);
        return;
      }

      thisobj._handleResponse(response);
    });

    //handle errors
    request.addEventListener("error",function() {
      thisobj._status=thisobj.STATUS_NOT_LOADED;
      thisobj.log.error("Failed to load story!", thisobj);
    });
    request.addEventListener("abort",function() {
      thisobj._status=thisobj.STATUS_NOT_LOADED;
      thisobj.log.error("Story loading aborted!", thisobj);
    });

    //send the request
    request.send();
  }

  this.loadFromObject = function(story) {
    this._handleResponse(story);
  }

  /** Reads the parsed json and prepares the assets **/
  this._handleResponse=function(story) {
    this._loadCounter=0;

    //First things first. Check the story format
    if(story.format=="p316") {
      story = this.convertP316toP417(story);
    } else if(typeof story.format=="undefined" || story.format!="p417") {
      //TODO unsupported story! handle this event
      this.log.error("Unsupported format!", this);
      return;
    }

    this._totalAssets=story.actors.length+story.audiotracks.length
    this.format = story.format;
    this.title = story.title;
    this.width = story.width;
    this.height = story.height;

    var assetsPath = "";
    if(this._baseURL!=null && this._baseURL!="") {
      assetsPath = this._baseURL;
    } else {
      assetsPath = this.getPathFromURL(this._storyURL);
    }

    //Load actor images
    for(var i=0;i<story.actors.length;i++) {
      story.actors[i] = new MovableObject().initWithActor(
        story.actors[i],
        function() {thisobj._assetLoaded();},
        assetsPath
      );
    }

    //Load audio tracks
    for(var i=0;i<story.audiotracks.length;i++) {
        story.audiotracks[i]=new this.AudioTrack(
          story.audiotracks[i],
          function() {thisobj._assetLoaded();},
          assetsPath
        );
    }

    //Get actors and audio tracks
    this.actors=story.actors;
    this.audiotracks=story.audiotracks;

    //Add the system actors
    this.actors.push(this.trigger);
    this.actors.push(this.stagecurtain);
    this.actors.push(this.viewport);

    //Get and prepare the timeline
    this.timeline=story.timeline;
    //Sort the events by time
    this._sortTimeline();

    //Map names to array indices
    this._mapNamesToIndeces();

    this._findLanguages();

    if(this._totalAssets==0) {this._assetLoaded();} //For empty stories
  }

  this._sortTimeline = function() {
    this.timeline.sort(function(event1,event2) {
      return event1.time-event2.time;
    });
  }

  this._mapNamesToIndeces = function() {
    for(var i=0;i<this.timeline.length;i++) {
      //actors
      if(typeof this.timeline[i].actor!="undefined") {
        for(var acti=0;acti<this.actors.length;acti++) {
          if(this.timeline[i].actor==this.actors[acti].name) {
            this.timeline[i].index=acti;
          }
        }
      }
      //audiotracks
      else if(typeof this.timeline[i].audiotrack!="undefined") {
        for(var trki=0;trki<this.audiotracks.length;trki++) {
          if(this.timeline[i].audiotrack==this.audiotracks[trki].getName()) {
            this.timeline[i].index=trki;
          }
        }
      }
    }
  }

  //Resets actors to their initial positions
  this.resetActors = function() {
    for(var i=0;i<this.actors.length;i++) {
      this.actors[i].resetPosition();
    }
    //reset system actors
    this.viewport.x=0;
    this.viewport.y=0;
  }

  this.resetAudiotracks = function() {
    for(var i=0;i<this.audiotracks.length;i++) {
      this.audiotracks[i].stop();
    }
  }

  //Convert P316 stories to the latest format P417
  this.convertP316toP417 = function(story) {
    for(var i=0; i<story.timeline.length; i++) {
      var event = story.timeline[i];
      if(typeof event.action=="string" && (event.action=="show" || event.action=="hide")) {
        var action = {type: event.action};
        story.timeline[i].action = action;
      }
    }
    story.format = "p417";
    this.log.message("Story converted from P316 to P417.", thisobj);
    return story;
  }

  //Return the maximum ID assigned to a timeline event
  this.getMaxId = function() {
    var maxId = 0;
    for(var i=0; i<this.timeline.length; i++) {
      if(this.timeline[i]._id>maxId) {
        maxId = this.timeline[i]._id;
      }
    }
    return maxId;
  }

  //returns the duration of the story
  this.getDuration = function() {
    return this.timeline[this.timeline.length-1].time;
  }

  /** Searches all subtitles and fills the languages array with all the
  available languages **/
  this._findLanguages = function() {
    this.languages = new Array();
    for(var ei=0;ei<this.timeline.length;ei++) {
      var currentEvent = this.timeline[ei];
      if(typeof currentEvent.subtitle!="undefined") {
        //we found a subtitle
        var keys = Object.keys(currentEvent.subtitle);
        for(var ki=0;ki<keys.length;ki++) {
          var currentKey = keys[ki];
          var found = false;
          for(var li=0;li<this.languages.length;li++) {
            if(currentKey==this.languages[li]) {
              found = true;
              break;
            }
          }
          if(!found) {
            this.languages.push(currentKey);
          }
        }
      }
    }
  }

  /** This function is called everytime an asset gets loaded and counts the
  loaded assests and calls the onload function. When everything is loaded it
  calls the onload function **/
  this._assetLoaded=function() {
    this.onprogress(++this._loadCounter,this._totalAssets);
    if(this._loadCounter>=this._totalAssets) {
      //Story loaded!
      this.log.message("Story loaded!", thisobj);
      this._status=thisobj.STATUS_LOADED;
      this.onload();
    }
  }

  /** This function is called repeatedly while the assets are loading to
  propagete the current progress **/
  this.onprogress=function(assetsLoaded, totalAssets) {}

  /** This function is called when the requested story finishes loading and is
  ready for use **/
  this.onload=function() {}

  /** This function returns true if the story is completely loaded **/
  this.isLoaded = function() {
    if(this._status==this.STATUS_LOADED) {return true;}
    else {return false;}
  }

  this.addActor = function(actor) {
    var newActor = new MovableObject().initWithActor(actor, function() {}, this._baseURL);
    this.actors.push(newActor);
  }

  /** This function removes an 'Actor' from the story **/
  this.removeActor = function(name) {
    //Remove from the actors list
    for(var i=0; i<this.actors.length; i++) {
      if(this.actors[i].name==name) {
        this.actors.splice(i, 1);
        break;
      }
    }
    //Remove from timeline
    for(var i=0; i<this.timeline.length; i++) {
      var event = this.timeline[i];
      if(typeof(event.actor)!="undefined" && event.actor==name) {
        this.timeline.splice(i, 1);
        i=0; //start again
      }
    }
    //Indeces changed!
    this._mapNamesToIndeces();
  }

  this.addAudiotrack = function(audiotrack) {
    var newAudiotrack = new this.AudioTrack(audiotrack, function() {}, "");
    this.audiotracks.push(newAudiotrack);
  }

  /** This function removes an 'Audiotrack' from the story **/
  this.removeAudiotrack = function(name) {
    //Remove from the actors list
    for(var i=0; i<this.audiotracks.length; i++) {
      if(this.audiotracks[i].name==name) {
        this.audiotracks.splice(i, 1);
        break;
      }
    }
    //Remove from timeline
    for(var i=0; i<this.timeline.length; i++) {
      var event = this.timeline[i];
      if(typeof(event.audiotrack)!="undefined" && event.audiotrack==name) {
        this.timeline.splice(i, 1);
        i=0; //start again
      }
    }
    //Indeces changed!
    this._mapNamesToIndeces();
  }

  this.removeTimelineEvent = function(eventId) {
    for(var i=0; i<this.timeline.length; i++) {
      if(this.timeline[i]._id==eventId) {
        this.timeline.splice(i, 1);
        return;
      }
    }
  }

  this.getPathFromURL = function(url) {
    if(url==null) {return "";}

    var lastSlashIndex = url.lastIndexOf("/");
    if(lastSlashIndex>0) {
      return url.substr(0, lastSlashIndex+1);
    } else {
      return "";
    }
  }

  this.addBaseToURL = function(url, baseURL) {
    var protocolRegex = /[a-zA-Z0-9]+:\/\//g;

    // Absolute paths
    if(url[0]=="/" || protocolRegex.exec(url)!=null) {
      return url;
    }
    // Relative paths
    else {
      if(baseURL==null) {
        return url;
      } else {
        // Remove any files from the path
        return this.getPathFromURL(baseURL)+url;
      }
    }
  }

}

//////////// MovableObject ////////////
function MovableObject() {
  this._origin = null;
  this.name = null;
  this.url = null;
  this.image = null;
  this.startX = 0;
  this.startY = 0;
  this.startZ = 1;
  this.x;
  this.y;
  this.z;
  this.motion = {type:"ellipse",freq:0.1,x:0,y:0};
  this.sprite = null;

  this.initWithZ = function(name,z) {
    this.name = name;
    this.startZ = z;
    this.resetPosition();
    return this;
  }

  this.initWithActor = function(actor, loadHandler, assetsPath) {
    this._origin = actor;
    this.name = actor.name;
    this.url = actor.url;
    this.startX = actor.x;
    this.startY = actor.y;
    this.startZ = actor.z;
    this.resetPosition();
    if(typeof actor.motion!="undefined") {this.motion = actor.motion;}
    if(typeof actor.sprite!="undefined") {this.sprite = actor.sprite;}

    this.image=new Image();
    this.image.onload=function(){loadHandler();}
    if(typeof assetsPath=="undefined" || assetsPath==null) {assetsPath="";}
    this.image.src=assetsPath+actor.url;
    //add the motion object
    if(typeof actor.motion=="undefined") {
      this.resetMotion();
    } else {
      this.motion = actor.motion;
    }
    return this;
  }

  this.changeImage = function(newImage, assetsPath) {
    if(typeof assetsPath=="undefined") {assetsPath="";}
    this.url = newImage;
    this.image.src = assetsPath+this.url;
  }

  this.resetMotion = function() {
    this.motion = {"type":null,"freq":0,"x":0,"y":0,"r":0};
  }

  this.resetPosition =  function() {
    this.x = this.startX;
    this.y = this.startY;
    this.z = this.startZ;
  }
}

},{"./mod-audiotrack.js":1,"./mod-log.js":3}],7:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  // this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this._assets = [];

  // this.eventsManager=new this._EventsManager();

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "event-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "padding:0; max-height:500px; overflow-y:auto;"
  this._container.appendChild(this._containerBody);

  //--Functions--//

  this.setAssets = function(assets) {
    this._assets = assets;

    this._containerBody.innerHTML = "";

    for(var i=0; i<this._assets.length; i++) {
      var option = document.createElement("a");
      option.assetName = this._assets[i];
      option.style.cssText = "display:block; padding:2px 1em; color:#000";
      option.innerHTML = this._assets[i];
      option.setAttribute("href","javascript:");
      option.onclick = this._onselect;
      this._containerBody.appendChild(option);
    }
  }

  this._onselect = function() {
    if(thisobj.onselect!=null) {
      thisobj.onselect(this.assetName);
    }
  }

  this.onselect = function(assetName) {}

}

},{}],8:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this.log = require("./../../common/mod-log.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");
  this._AssetEditor = require("./mod-asseteditor.js");
  this._Popup = require("./../popup/popup.js");

  //--Variables--//
  this._logName = "Assets Manager";
  this._assets = [];
  this.eventsManager = new this._EventsManager();
  this._assetEditor = new this._AssetEditor();
  this._popup = new this._Popup();
  this._baseURL = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "assets-container";
  this._container.style.cssText = "position:relative;height:100%;user-select:none;";
  //container > list
  this._listElem = document.createElement("div");
  this._listElem.className = "assets-list";
  this._listElem.style.cssText = "padding-bottom:2em;height:100%;overflow-y:scroll;";
  this._container.appendChild(this._listElem);
  //container > controls
  this._controlsElem = document.createElement("div");
  this._controlsElem.className = "assets-controls";
  this._controlsElem.style.cssText = "position:absolute;bottom:0;width:100%;";
  this._container.appendChild(this._controlsElem);
  //container > controls > add actor
  this._addActorButton = document.createElement("a");
  this._addActorButton.className = "button";
  this._addActorButton.style.cssText = "line-height:1.5em;margin-right:1%;width:32%";
  this._addActorButton.innerHTML = "+ Actor";
  this._controlsElem.appendChild(this._addActorButton);
  //container > controls > add audiotrack
  this._addAudiotrackButton = document.createElement("a");
  this._addAudiotrackButton.className = "button";
  this._addAudiotrackButton.style.cssText = "line-height:1.5em;margin-right:1%;width:32%";
  this._addAudiotrackButton.innerHTML = "+ Audio";
  this._controlsElem.appendChild(this._addAudiotrackButton);
  //container > controls > remove
  this._removeAssetButton = document.createElement("a");
  this._removeAssetButton.className = "button";
  this._removeAssetButton.style.cssText = "line-height:1.5em;width:32%";
  this._removeAssetButton.innerHTML = "Remove";
  this._controlsElem.appendChild(this._removeAssetButton);

  this.setBaseURL = function(baseURL) {
    this._baseURL = baseURL;
  }

  this.clear = function() {
    this._listElem.innerHTML = "";
    this._assets = [];
  }

  this.addAsset = function(asset) {
    if(typeof asset=="undefined" || asset==null) {
      this.log.warning("Won't add 'null' to assets list!", this);
      return;
    }
    asset.onclick = this._assetSelected;
    asset.ondblclick = this._assetDoubleClicked;
    this._assets.push(asset);
    this._listElem.appendChild(asset._container);
  }

  this._assetSelected = function(asset) {
    if(!asset.isSelected()) {
      asset.setSelected(true);
      for(var i=0; i<thisobj._assets.length; i++) {
        if(thisobj._assets[i]!=asset) {
          thisobj._assets[i].setSelected(false);
        }
      }
    } else {
      asset.setSelected(false);
    }
  }

  this._getSelectedAssets = function() {
    var selected = [];
    for(var i=0; i<this._assets.length; i++) {
      if(this._assets[i].isSelected()) {
        selected.push(this._assets[i]);
      }
    }
    return selected;
  }

  this._assetDoubleClicked = function(asset) {
    asset.setSelected(true);
    thisobj._assetEditor.editAsset(asset, thisobj._baseURL);
    thisobj._popup.show("Edit &quot;"+asset.name+"&quot;", thisobj._assetEditor._container, null, [
      {name:"Cancel",handler:function(){thisobj._popup.hide();}},
      {name:"OK",handler:function() {
        var update = thisobj._assetEditor.getResult();
        thisobj.eventsManager.callHandlers("updateasset", {name:asset.name, type:asset.type, settings:update});
        asset.name = update.name;
        if(asset.type=="actor") {
          asset.settings.x = update.x;
          asset.settings.y = update.y;
          asset.settings.z = update.z;
          if(typeof update.motion!="undefined") {asset.settings.motion = update.motion;}
          else if(asset.settings.motion!="undefined") {asset.settings.motion = null;}
          if(typeof update.sprite!="undefined") {asset.settings.sprite = update.sprite;}
          else if(asset.settings.sprite!="undefined") {asset.settings.sprite = null;}
        } else if(asset.type=="audiotrack") {
          asset.settings.volume = update.volume;
        }
        asset.refresh();
        thisobj._popup.hide();
      }}
    ]);
  }

  this._addAssetButtonClick = function(type) {
    thisobj._assetEditor.editAsset(type);
    thisobj._popup.show("New Asset", thisobj._assetEditor._container, null, [
      {name:"Cancel",handler:function(){thisobj._popup.hide();}},
      {name:"OK",handler:function() {
        var newAsset = thisobj._assetEditor.getResult();
        thisobj.eventsManager.callHandlers("add"+type, newAsset);
        thisobj._popup.hide();
      }}
    ]);
  }
  this._addActorButton.onclick = function() {thisobj._addAssetButtonClick("actor");}
  this._addAudiotrackButton.onclick = function() {thisobj._addAssetButtonClick("audiotrack");}

  this._removeButtonClick = function() {
    var selected = this._getSelectedAssets();
    if(selected.length==0) {return;}
    if(!confirm("Are you sure?")) {return;}
    for(var i=0; i<selected.length; i++) {
      var selectedAsset = selected[i];
      //remove from dom tree
      selectedAsset._container.remove();
      //remove from assets list
      this._assets.splice(this._assets.indexOf(selectedAsset),1);
      //notify listeners
      this.eventsManager.callHandlers("removeasset", {type:selectedAsset.type, name:selectedAsset.name});
    }
  }
  this._removeAssetButton.onclick = function() {thisobj._removeButtonClick();}

  /////////////////////////////////

  this.Asset = function(type, name, url, settings) {

    var thisobj = this;

    this.type = (typeof type!="undefined" && type=="actor")?type:"audiotrack";
    this.name = name;
    this.url = url;
    this.settings = settings;
    this._selected = false;
    this.actorIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGDSURBVDiN1dK/axRBGIfxZzzisSDYxG6xkGhnaSOKP7DaciHY2dkIgoVN9J8QBKu71k5WLWJjEY6IhWBjKWyKLIIoaDDGS+R8bC4y7mV31av8Njvv7MtnZl8W/uuoibqivla31Y/q9XnARfWNs/mmHvlXdPUAcD+Xo7776oZ6oQs82wKqXot6H0/3PqhHY+dQzb0KUA4GjLKMcjisn3ssWn+ePheB5Tb0DEBVFEzGY6qiqKOnovX3aJ21oUsAaZ7TSxLSPK+jy+pJ9QRwJdo/HTeFuFB3gcN16Q/yNYTw68+o31SA1XLAnVHGs3Jmpk3px0Ud3QJ4URXsTcasVzMzbcpOG/oW4Fya0+8lnE9nZtqUd41v1Hsd/2lTfvuk+k0fxcXgSUl2a8Twadl10+dt6Drwar8o1irGexOKtaoN3AIeNqIhBIGbwC5Afikl6ffIL6Zt6O0Qwqe2BgDUXP3SMcdt9UYnVoOX1AfqpvpjCr1XX6p31eN/BR5wwIK6MBcyb34C7WdjQZPGMB0AAAAASUVORK5CYII=";
    this.audiotrackIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGbSURBVDiN3ZQ/T1NxFIaf91pDE8oCbvI5aA1L72XAmDDScAlDGRhYiAqsDKxGAy6EsHTrVVkIIdCh3A4ktF/AT6AbMCiQ8vc4eGuapvWWhkXf6fz7PTnn5OQH/53MbKXbWnUJXALeSfpTXw68SWEFwd55fyo/MbF72TXUzN4C7wGaoQBhkM0YKgFf67fJ8Vcz+z8AnBjg6wawndypShVjHsgkE/WN2E7NbAFYb461dtrQYeBWgTRGxvPDWqIJYi2P19sBwmI2b9ImsH3iPJvN5b5cm1SQWVpYHqj9dfx2cv1KQb8vYXrITlcBnLv7CoBJWYjZaSddPenbApDZHAAJvkWp4Z6hL3Ols8gcBHBzlfPIT/UMPfg8PhiZZwBHO6MDkf+zZ2jf3dUcgElbADcXT59Hqe89QQ+L7rRJq4YKpxpaAbh3HDdKh/AId2qGwk/uMTCC8cLzw84nJekj8Cau8zBwfSANFD0/rEHM+JLWgMXOwGwGsQFU67fJ+UY8dqeSPgDLrfFy4E0aKgtKF/2pscZn8iA95D/9d/QL6MuRt4ZLgUIAAAAASUVORK5CYII=";

    //container
    this._container = document.createElement("div");
    this._container.className = "asset "+this.type;
    // this._container.innerHTML = name;
    //container > icon
    this._assetIconElem = document.createElement("div");
    this._assetIconElem.style.cssText = "display:inline-block; width:21px;height:21px; vertical-align:middle; opacity:0.5;";
    this._assetIconElem.style.backgroundImage = "url("+(type=="actor"?this.actorIcon:this.audiotrackIcon)+")";
    this._container.appendChild(this._assetIconElem);
    //container > label
    this._labelElem = document.createElement("div");
    this._labelElem.style.cssText = "display:inline-block; line-height:21px; vertical-align:middle; margin-left:0.5em";
    this._labelElem.innerHTML = name;
    this._container.appendChild(this._labelElem);

    this.refresh = function() {
      this._labelElem.innerHTML = this.name;
    }

    this.setSelected = function(selected) {
      this._selected = selected;
      if(selected==true) {
        thisobj._container.className = "asset selected "+thisobj.type;
      } else {
        this._container.className = "asset "+this.type;
      }
    }

    this.isSelected = function() {
      return this._selected;
    }

    this._container.onclick = function(event) {
      thisobj.onclick(thisobj);
    }

    this._container.ondblclick = function(event) {
      thisobj.ondblclick(thisobj);
    }

    this.onclick = function() {};

    this.ondblclick = function() {};

  }

}

},{"./../../common/mod-eventsmanager.js":2,"./../../common/mod-log.js":3,"./../popup/popup.js":16,"./mod-asseteditor.js":9}],9:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Variables--//

  this._currentAsset = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "asset-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "asset-editor-body";
  this._containerBody.style.cssText = "padding:0.5em";
  this._container.appendChild(this._containerBody);
  //container > body > preview
  this._assetPreview = document.createElement("img");
  this._assetPreview.className = "preview"
  this._assetPreview.style.cssText = "float:right;max-width:120px;max-height:120px;border:1px solid #aaa";
  this._containerBody.appendChild(this._assetPreview);
  //container > body > asset-name
  this._containerBody.innerHTML+="Name ";
  this._assetName = document.createElement("input");
  this._assetName.className = "asset-name"
  this._assetName.style.marginBottom = "0.5em";
  this._assetName.setAttribute("name","name");
  this._containerBody.appendChild(this._assetName);
  //container > body > asset-url
  this._containerBody.innerHTML+="<br>URL ";
  this._assetUrl = document.createElement("input");
  this._assetUrl.className = "asset-url"
  this._assetUrl.style.marginBottom = "0.5em";
  this._assetUrl.setAttribute("name","url");
  this._containerBody.appendChild(this._assetUrl);
  //container > body > asset-settings
  this._assetSettings = document.createElement("div");
  this._containerBody.appendChild(this._assetSettings);

  //actor
  this._actorEditor = document.createElement("div");
  this._actorEditor.className = "actor-editor";
  this._actorEditor.style.cssText = "padding:0;"
  //actor > xyz
  this._actorPosition = document.createElement("div");
  this._actorPosition.className = "actor-position";
  this._actorPosition.innerHTML = "X <input type='number' name='x' style='margin-bottom:0.2em'><br/>"+
                                    "Y <input type='number' name='y' style='margin-bottom:0.2em'><br/>"+
                                    "Z <input type='number' name='z' style='margin-bottom:0.2em'><br/>";
  this._actorEditor.appendChild(this._actorPosition);

  //actor > ---
  this._actorEditor.appendChild(document.createElement("hr"));
  //actor > actor-type
  this._actorEditor.innerHTML+="Type ";
  this._actorTypeSelector = document.createElement("select");
  this._actorTypeSelector.setAttribute("name","type");
  this._actorTypeSelector.className = "actor-type";
  this._actorTypeSelector.style.marginBottom = "1em";
  this._actorTypeSelector.innerHTML = "<option value='static'>Static</option>"+
                                    "<option value='motion'>Motion</option>"+
                                    "<option value='sprite'>Sprite</option>";
  this._actorEditor.appendChild(this._actorTypeSelector);
  this._actorTypeSelectorOnChange = function() {
    thisobj._actorTypeSettings.innerHTML = "";
    if(thisobj._actorTypeSelector.value=="motion") {
      thisobj._actorTypeSettings.appendChild(thisobj._actorMotion);
      thisobj._motionTypeSelectorOnChange();
    } else if(thisobj._actorTypeSelector.value=="sprite") {
      thisobj._actorTypeSettings.appendChild(thisobj._actorSprite);
    }
  }
  this._actorTypeSelector.onchange = this._actorTypeSelectorOnChange;
  //actor > type-settings
  this._actorTypeSettings = document.createElement("div");
  this._actorTypeSettings.className = "actor-type-settings";
  this._actorEditor.appendChild(this._actorTypeSettings);

  //motion
  this._actorMotion = document.createElement("div");
  this._actorMotion.className = "motion-editor";
  this._actorMotion.innerHTML = "Motion <select name='type' style='margin-bottom:0.5em'>"+
                                "<option value='rotate'>Rotate</option>"+
                                "<option value='vsin'>Vertical Sinusoid</option>"+
                                "<option value='ellipse'>Ellipse</option>"+
                                "<option value='swing'>Swing</option>"+
                                "</select><br>"+
                                "<div class='motion-attributes'></div>";
  this._motionTypeSelectorOnChange = function() {
    var attrContainer = thisobj._actorMotion.children[2];
    attrContainer.innerHTML = "";
    if(thisobj._actorMotion.children[0].value=="swing") {
      attrContainer.appendChild(thisobj._swingAttributes);
    } else {
      attrContainer.appendChild(thisobj._genericMotionAttributes);
    }
  }
  this._actorMotion.children[0].onchange = this._motionTypeSelectorOnChange;

  //motion > attributes
  this._genericMotionAttributes = document.createElement("div");
  this._genericMotionAttributes.innerHTML = "Frequency <input type='number' name='freq' style='margin-bottom:0.5em'><br>"+
                                "Phase <input type='number' name='phase' style='margin-bottom:0.5em'>";
  this._swingAttributes = document.createElement("div");
  this._swingAttributes.innerHTML = "Amplitude <input type='number' name='amp' style='margin-bottom:0.5em'><br>"+
                                "Frequency <input type='number' name='freq' style='margin-bottom:0.5em'><br>"+
                                "Phase <input type='number' name='phase' style='margin-bottom:0.5em'>";


  //sprite
  this._actorSprite = document.createElement("div");
  this._actorSprite.className = "sprite-editor";
  this._actorSprite.innerHTML = "Total Frames <input type='number' name='frames' style='margin-bottom:0.5em'><br>"+
                                "Initial Frame <input type='number' name='current' style='margin-bottom:0.5em'><br>"+
                                "Frame Period (ms) <input type='number' name='period' style='margin-bottom:0.5em'><br>"+
                                "Frame Width <input type='number' name='width' style='margin-bottom:0.5em'><br>"+
                                "Frame Height <input type='number' name='height' style='margin-bottom:0.5em'>";

  //audiotrack
  this._audiotrackEditor = document.createElement("div");
  this._audiotrackEditor.className = "audiotrack-editor";
  this._audiotrackEditor.style.cssText = "padding:0;"
  //audiotrack > volume
  this._audiotrackEditor.innerHTML += "Volume ";
  this._audiotrackVolume = document.createElement("input");
  this._audiotrackVolume.setAttribute("type", "number");
  this._audiotrackVolume.setAttribute("name", "volume");
  this._audiotrackEditor.className = "audiotrack-volume";
  this._audiotrackEditor.appendChild(this._audiotrackVolume);

  //--Functions--//

  this.editAsset = function(asset, baseURL) {
    if(typeof baseURL=="undefined" || baseURL==null) {baseURL = "";}

    if(asset=="actor") {
      asset = {};
      asset.name = "";
      asset.type = "actor";
      asset.url = "";
      asset.settings = {};
      asset.settings.x = 0;
      asset.settings.y = 0;
      asset.settings.z = 1;
      asset.settings.motion = {};
    } if(asset=="audiotrack") {
      asset = {};
      asset.name = "";
      asset.type = "audiotrack";
      asset.url = "";
      asset.settings = {};
      asset.settings.volume = 1;
    }

    this._currentAsset = asset;
    // console.log(asset);

    this._assetSettings.innerHTML="";

    this._containerBody.children["name"].value = asset.name;
    this._containerBody.children["url"].value = asset.url;

    if(asset.type=="actor") {
      this._containerBody.children[0].setAttribute("src", this._addBaseToURL(asset.url, baseURL));
      this._actorEditor.children[0].children["x"].value = asset.settings.x;
      this._actorEditor.children[0].children["y"].value = asset.settings.y;
      this._actorEditor.children[0].children["z"].value = asset.settings.z;
      if(typeof asset.settings.motion!="undefined" && asset.settings.motion!=null && asset.settings.motion.type!=null) {
        //Motion
        this._actorTypeSelector.value = "motion";
        this._actorTypeSelectorOnChange();
        this._actorEditor.children[3].children[0].children["type"].value = asset.settings.motion.type;
        this._actorEditor.children[3].children[0].children[2].children[0].children["freq"].value = asset.settings.motion.freq;
        this._actorEditor.children[3].children[0].children[2].children[0].children["phase"].value = asset.settings.motion.phase;
        if(asset.settings.motion.type=="swing") {this._actorEditor.children[3].children[0].children[2].children[0].children["amp"].value = asset.settings.motion.amp;}
      } else if(asset.settings.sprite!=null) {
        //Sprite
        this._actorTypeSelector.value = "sprite";
        this._actorTypeSelectorOnChange();
        this._actorEditor.children[3].children[0].children["frames"].value = asset.settings.sprite.frames;
        this._actorEditor.children[3].children[0].children["current"].value = asset.settings.sprite.current;
        this._actorEditor.children[3].children[0].children["period"].value = asset.settings.sprite.period;
        this._actorEditor.children[3].children[0].children["width"].value = asset.settings.sprite.width;
        this._actorEditor.children[3].children[0].children["height"].value = asset.settings.sprite.height;
      } else {
        //Static
        this._actorTypeSelector.value = "static";
        this._actorTypeSelectorOnChange();
      }
      this._assetSettings.appendChild(this._actorEditor);
    } else if(asset.type=="audiotrack") {
      this._containerBody.children[0].setAttribute("src","");
      this._audiotrackVolume.value = asset.settings.volume;
      this._assetSettings.appendChild(this._audiotrackEditor);
    }
  }

  this.getResult = function() {
    var updatedAsset = {};
    updatedAsset.name = this._containerBody.children["name"].value;
    updatedAsset.url = this._containerBody.children["url"].value;
    //updatedAsset.settings = {};
    if(this._currentAsset.type=="actor") {
      updatedAsset.x = this._actorEditor.children[0].children["x"].value*1;
      updatedAsset.y = this._actorEditor.children[0].children["y"].value*1;
      updatedAsset.z = this._actorEditor.children[0].children["z"].value*1;
      if(this._actorEditor.children["type"].value=="motion") {
        updatedAsset.motion = {};
        updatedAsset.motion.type = this._actorEditor.children[3].children[0].children["type"].value;
        updatedAsset.motion.freq = this._actorEditor.children[3].children[0].children[2].children[0].children["freq"].value*1;
        updatedAsset.motion.phase = this._actorEditor.children[3].children[0].children[2].children[0].children["phase"].value*1;
        if(updatedAsset.motion.type=="swing") {updatedAsset.motion.amp = this._actorEditor.children[3].children[0].children[2].children[0].children["amp"].value*1;}
      } else if(this._actorEditor.children["type"].value=="sprite") {
        updatedAsset.sprite = {};
        updatedAsset.sprite.frames = this._actorEditor.children[3].children[0].children["frames"].value*1;
        updatedAsset.sprite.current = this._actorEditor.children[3].children[0].children["current"].value*1;
        updatedAsset.sprite.period = this._actorEditor.children[3].children[0].children["period"].value*1;
        updatedAsset.sprite.width = this._actorEditor.children[3].children[0].children["width"].value*1;
        updatedAsset.sprite.height = this._actorEditor.children[3].children[0].children["height"].value*1;
      }
    } else if(this._currentAsset.type=="audiotrack") {
      updatedAsset.volume = this._audiotrackVolume.value*1;
    }
    return updatedAsset;
  }

  this._getPathFromURL = function(url) {
    if(url==null) {return "";}

    var lastSlashIndex = url.lastIndexOf("/");
    if(lastSlashIndex>0) {
      return url.substr(0, lastSlashIndex+1);
    } else {
      return "";
    }
  }

  this._addBaseToURL = function(url, baseURL) {
    var protocolRegex = /[a-zA-Z0-9]+:\/\//g;

    // Absolute paths
    if(url[0]=="/" || protocolRegex.exec(url)!=null) {
      return url;
    }
    // Relative paths
    else {
      if(baseURL==null) {
        return url;
      } else {
        // Remove any files from the path
        return this._getPathFromURL(baseURL)+url;
      }
    }
  }

}

},{}],10:[function(require,module,exports){
//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/mod-log.js");
  this.AssetsManager = require("./assetsmanager/assetsmanager.js");
  this.AssetSelector = require("./assetselector/assetselector.js");
  this.StorageHelper = require("./storagehelper/storagehelper.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.EventEditor = require("./eventeditor/eventeditor.js");
  this.StoryGlobalSettingsEditor = require("./storyglobalsettings/storyglobalsettings.js");
  this.LoadHistory = require("./loadhistory/loadhistory.js");
  this.Popup = require("./popup/popup.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.13.2";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player(null, {showControls:false, height:"100%"});
  this.timelineEditor = new this.TimelineEditor();
  this.eventEditor = new this.EventEditor();
  this.assetsManager = new this.AssetsManager();
  this.assetSelector = new this.AssetSelector();
  this.popup = new this.Popup();
  this.storageHelper = new this.StorageHelper();
  this.storyGlobalSettingsEditor = new this.StoryGlobalSettingsEditor();
  this.loadHistory = new this.LoadHistory();

  //check that the required libraries are present
  if(typeof jQuery=="undefined") { this.log.error("The Drama Platform Editor requires jQuery to work!", this); return;}
  if(typeof w2ui=="undefined") {this.log.error("The Drama Platform Editor requires w2ui to work!", this); return;}

  //--elements--//
  this.container = document.getElementById(containerId);
  this.toolbar = document.createElement("div");

  //--functions--//

  //init layout
  this._init = function() {
    thisobj.player.eventsManager.addListener("ready", function() {thisobj._storyLoaded();});
    thisobj.player.eventsManager.addListener("playbacktimechange", function(time) {thisobj._onPlaybackTimeChange(time);});
    thisobj.player.playbackProgressTimerInterval = 50;

    thisobj._initToolbar();

    var layoutStyle = 'border: 1px solid #dfdfdf; padding: 0px; overflow: hidden;';
    var mainStyle = layoutStyle + "background-color:#000;";
    var rightStyle = layoutStyle + "background-color:#222;";
    var bottomStyle = layoutStyle + "background-color:#222;";
    $("#"+containerId).w2layout({
      name: 'layout',
      padding: 4,
      panels: [
        { type: 'top', size: 30, resizable: false, style: layoutStyle, toolbar: thisobj.toolbar },
        { type: 'main', style: mainStyle, content: thisobj.player.playerElement},
        { type: 'right', size: 300, resizable: true, style: rightStyle, content: thisobj.assetsManager._container },
        { type: 'bottom', size: 300, resizable: true, style: bottomStyle, content: thisobj.timelineEditor._container }
      ],
      onResize: thisobj._layoutResizeHandler
    });

    document.addEventListener("keydown", thisobj._onKeydownGlobal);
  }

  //init the top toolbar
  this._initToolbar = function() {
    this.toolbar = {
      name: "topbar",
    	items: [
        { type: 'menu', id: 'file-menu', text: 'File', img: 'icon-page', items: [
          { text: 'New story', id: 'new-story'},
          { text: '--' },
          { text: 'Load from browser', id: 'load-local-storage'},
          { text: 'Load from URL&hellip;', id: 'load-url'},
          { text: 'Load history&hellip;', id: 'show-load-history'},
          { text: '--' },
          { text: 'Save to browser', id: 'save-local-storage'},
          { text: 'Save to file', id: 'save-export'}
        ]},
        { type: 'break', id: 'break1' },
        { type: 'check', id: 'playback-ctls-play', text: 'Play', onClick: function(event){
          if(!event.item.checked) {thisobj.player.play();}
          else {thisobj.player.pause();}
        }},
        { type: 'button', id: 'playback-ctls-stop', text: 'Stop', onClick: function(event){
          w2ui["layout_top_toolbar"].uncheck("playback-ctls-play");
          thisobj.player.stop();
          thisobj._onPlaybackTimeChange({time:0, forced:false});
        }},
        { type: 'html', id: 'playback-ctls-timegauge', html: '<span class="minutes">00</span>:<span class="seconds">00</span>.<span class="millis">000<span>'},
        { type: 'break', id: 'break1' },
        { type: 'menu',   id: 'playback-ctls-subtitles', caption: 'Subtitles', items: [], onClick: function(event){
          console.log("lang");
        }},
        { type: 'break', id: 'break1' },
        { type: 'button', id: 'playback-ctls-fullscreen', text: 'Fullscreen', onClick: function(event){
          thisobj.player.setFullscreen(true);
        }},
        { type: 'break', id: 'break1' },
    		{ type: 'spacer' },
    		{ type: 'button',  id: 'story-title',  caption: 'Untitled'}
    	],
      onClick: function(event) {
        if(event.item.id=="playback-ctls-subtitles" && event.subItem!=null) {
          thisobj.player.setLanguage(event.subItem.langIndex);
          w2ui["layout_top_toolbar"].set("playback-ctls-subtitles", {caption:event.subItem.value});
        }
        //Save
        else if(event.item.id=="file-menu" && event.subItem!=null) {
          if(event.subItem.id=="new-story") {
            var newStory = {
              format: "p417",
              title: "Untitled",
              width: 800,
              height: 600,
              actors: [],
              audiotracks: [],
              timeline: []
            };
            thisobj.player.loadStory(newStory);
          }
          // Load
          else if(event.subItem.id=="load-local-storage") {
            //local storage
            var story = thisobj.storageHelper.load();
            thisobj.player.loadStory(story);
          } else if(event.subItem.id=="load-url") {
            //url
            var storyURL = prompt("Enter a story URL");
            if(storyURL!=null) {thisobj.player.loadStory(storyURL);}
            thisobj.loadHistory.save(storyURL);
          } else if(event.subItem.id=="show-load-history") {
              thisobj.loadHistory.show(function(url) {
                  thisobj.player.loadStory(url);
              });
          }
          // Save
          else if(event.subItem.id=="save-local-storage") {
            //local storage
            thisobj.storageHelper.save(thisobj.player.story);
          } else if(event.subItem.id=="save-export") {
            //export
            thisobj.storageHelper.export(thisobj.player.story);
          }
        }
        //Story Global Settings
        else if(event.item.id=="story-title") {
          var settings = {
            title: "Untitled",
            width: 800,
            height: 600
          };
          if(thisobj.player.story.isLoaded()) {
            settings.title = thisobj.player.story.title;
            settings.width = thisobj.player.story.width;
            settings.height = thisobj.player.story.height;
          }
          thisobj.storyGlobalSettingsEditor.setCurrentSettings(settings);
          thisobj.popup.show("Story Settings", thisobj.storyGlobalSettingsEditor._container, null, [
            {name:"Cancel", handler:function() {thisobj.popup.hide();}},
            {name:"OK", handler:function() {
              if(thisobj.storyGlobalSettingsEditor.settingsChanged()) {
                var newSettings = thisobj.storyGlobalSettingsEditor.getResult();
                thisobj.player.story.title = newSettings.title;
                thisobj.player.story.width = newSettings.width;
                thisobj.player.story.height = newSettings.height;
                thisobj.player._onresize();
                thisobj.player.stop();
                w2ui["layout_top_toolbar"].set("story-title", {caption:newSettings.title});
              }
              thisobj.popup.hide();
            }}
          ]);
        }
      }
    };
  }

  this._layoutResizeHandler = function() {
    thisobj.player._onresize();
  }

  this._storyLoaded = function() {
    var story = this.player.story;

    w2ui["layout_top_toolbar"].set("story-title", {caption:story.title});

    this._inflateAssetsManager(story);
    this._inflateTimeline(story);
    this._refreshLanguagesMenu();
  }

  this._refreshLanguagesMenu = function() {
    var subtitlesMenuItems = [];
    var languages = this.player.getLanguages();
    for(var i=0; i<languages.length; i++) {
      subtitlesMenuItems.push({
        langIndex:i,
        text:languages[i]+" subtitles",
        value:languages[i]
      });
    }
    var subtitlesMenu = w2ui["layout_top_toolbar"].get("playback-ctls-subtitles");
    w2ui["layout_top_toolbar"].set("playback-ctls-subtitles", {
      caption:this.player.getLanguageName(),
      count:subtitlesMenuItems.length
    });
    subtitlesMenu.items = subtitlesMenuItems;
  }

  this._inflateAssetsManager = function(story) {
    this.assetsManager.setBaseURL(story._storyURL);
    this.assetsManager.clear();
    for(var i=0; i<story.actors.length; i++) {
      var actor = story.actors[i];
      var actorSettings = {x:actor.x, y:actor.y, z:actor.z};
      if(typeof actor.motion=="object") {actorSettings.motion = actor.motion;}
      if(typeof actor.sprite=="object") {actorSettings.sprite = actor.sprite;}
      var asset = new this.assetsManager.Asset("actor", actor.name, actor.url, actorSettings);
      this.assetsManager.addAsset(asset);
    }
    for(var i=0; i<story.audiotracks.length; i++) {
      var audiotrack = story.audiotracks[i];
      var asset = new this.assetsManager.Asset("audiotrack", audiotrack._name, audiotrack._origin.url, {volume:audiotrack._volume});
      this.assetsManager.addAsset(asset);
    }
  }

  this._inflateTimeline = function(story) {
    this.timelineEditor.clear();
    for(var i=0; i<story.timeline.length; i++) {
      var groupName = story.timeline[i].actor || story.timeline[i].audiotrack;
      if(story.timeline[i].subtitle!=null) {groupName = "subtitles";}
      var endTime = null;
      if(
        story.timeline[i].action!=null &&
        typeof story.timeline[i].action=="object" &&
        story.timeline[i].action.params!=null &&
        typeof story.timeline[i].action.params=="object" &&
        typeof story.timeline[i].action.params.tt=="number"
      ) {
        endTime = story.timeline[i].action.params.tt;
      }
      story.timeline[i]._id = i;
      this.timelineEditor.addItem(i, groupName, this._getTimelineEventLabel(story.timeline[i]), story.timeline[i].time, endTime);
    }
    this.timelineEditor._inflateGroups();
    this.timelineEditor._render();
  }

  this._getTimelineEventLabel = function(timelineEvent) {
    var label="";
    if(timelineEvent.actor!=null && typeof timelineEvent.actor=="string") {
      if(timelineEvent.action!=null) {
        if(typeof timelineEvent.action=="string") {
          label = timelineEvent.action;
        } else if(typeof timelineEvent.action=="object" && timelineEvent.action.type!=null && typeof timelineEvent.action.type=="string") {
          label = timelineEvent.action.type;
        } else {
          label = timelineEvent.actor;
        }
      } else {
        label = timelineEvent.actor;
      }
    } else if(timelineEvent.audiotrack!=null && typeof timelineEvent.audiotrack=="string") {
      if(timelineEvent.action!=null && typeof timelineEvent.action=="string") {
        label = timelineEvent.action;
      } else {
        label = timelineEvent.audiotrack;
      }
    } else if(timelineEvent.subtitle!=null && typeof timelineEvent.subtitle=="object") {
      var tmp = Object.keys(timelineEvent.subtitle);
      label = timelineEvent.subtitle[tmp[0]];
      label = label.substr(0,14)+"&hellip;";
    }
    return label;
  }

  this._getTimelineEventById = function(id) {
    var story = this.player.story;
    for(var i=0; i<story.timeline.length; i++) {
      if(story.timeline[i]._id==id) {
        return story.timeline[i];
      }
    }
    return null; //id not found
  }

  this._onPlaybackTimeChange = function(change) {
    if(!change.forced) {
      this.timelineEditor.setCurrentTime(change.time);
    }
    //refresh the timegauge
    var minutes = Math.floor(change.time/60000);
    var seconds = Math.floor((change.time-(minutes*60000))/1000);
    var millis = (change.time-(minutes*60000+seconds*1000))|0;
    if(minutes<10) {minutes="0"+minutes;}
    if(seconds<10) {seconds="0"+seconds;}
    if(millis<10) {millis="00"+millis;} else if(millis<100) {millis="0"+millis;}
    $("#tb_layout_top_toolbar_item_playback-ctls-timegauge .minutes").text(minutes);
    $("#tb_layout_top_toolbar_item_playback-ctls-timegauge .seconds").text(seconds);
    $("#tb_layout_top_toolbar_item_playback-ctls-timegauge .millis").text(millis);
  }

  //initialize
  $(window).load(this._init);

  this._onUserTime = function(newTime) {
    thisobj.player.seek(newTime);
  }
  this.timelineEditor.eventsManager.addListener("currenttimechange", this._onUserTime);

  this._onEventChange = function(eventUI) {
    var story = thisobj.player.story;
    var timelineEvent = thisobj._getTimelineEventById(eventUI.id);
    timelineEvent.time = eventUI.startTime;
    if(
      typeof timelineEvent.action!="undefined" && timelineEvent.action!=null &&
      typeof timelineEvent.action.params!="undefined" && timelineEvent.action.params!=null
    ) {
      if(typeof timelineEvent.action.params.st!="undefined" && timelineEvent.action.params.st!=null) {
        timelineEvent.action.params.st = eventUI.startTime;
      }
      if(typeof timelineEvent.action.params.tt!="undefined" && timelineEvent.action.params.tt!=null) {
        timelineEvent.action.params.tt = eventUI.endTime;
      }
    }
    // console.log(eventUI, timelineEvent);
    story._sortTimeline();
  }
  this.timelineEditor.eventsManager.addListener("eventchange", this._onEventChange);

  this._onAddEvent = function(tmp) {
    //get the max ID
    var maxId = thisobj.player.story.getMaxId();

    //actor or audiotrack?
    var eventType = "other";
    for(var i=0; i<thisobj.player.story.actors.length; i++) {
      if(thisobj.player.story.actors[i].name==tmp.group) {
        eventType = "actor";
        break;
      }
    }
    for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
      if(thisobj.player.story.audiotracks[i]._name==tmp.group) {
        eventType = "audiotrack";
        break;
      }
    }

    var timelineEvent = {
      _id: maxId+1,
      time: tmp.time,
    };
    if(tmp.group=="subtitles") {
      timelineEvent.subtitle = {en:"text here"};
    } else if(eventType=="actor") {
      timelineEvent.actor = tmp.group;
      timelineEvent.action = {type:"show"};
    } else if(eventType=="audiotrack") {
      timelineEvent.audiotrack = tmp.group;
      timelineEvent.action = "play";
    }
    thisobj.player.story.timeline.push(timelineEvent);
    thisobj.player.story._sortTimeline();
    thisobj.player.story._mapNamesToIndeces();
    thisobj.timelineEditor.addItem(timelineEvent._id, tmp.group, thisobj._getTimelineEventLabel(timelineEvent), tmp.time, null);
    thisobj.timelineEditor._inflateGroups();
  }
  this.timelineEditor.eventsManager.addListener("addevent", this._onAddEvent);

  this._onEventDoubleClick = function(eventUI) {
    var timelineEvent = thisobj._getTimelineEventById(eventUI.id);
    thisobj.eventEditor.editTimelineEvent(timelineEvent);
    // thisobj.popup.show("Edit Event", thisobj.eventEditor._container, null, thisobj._onEventSave, thisobj._onEventCancel);
    thisobj.popup.show(
      "Edit Event",
      thisobj.eventEditor._container,
      null,
      [{name:"DELETE", handler:thisobj._onEventDelete}, {name:"Cancel", handler:thisobj._onEventCancel}, {name:"OK", handler:thisobj._onEventSave}]
    );
  }
  this.timelineEditor.eventsManager.addListener("eventdoubleclick", this._onEventDoubleClick, this._onEventCancel);

  this._onEventSave = function() {
    thisobj.eventEditor.save();
    var currentEventId = thisobj.eventEditor.currentView.currentEvent._id;
    var currentEvent = thisobj._getTimelineEventById(currentEventId);
    if(typeof currentEvent.action!="undefined" && typeof currentEvent.action.params.tt!="undefined") {
      thisobj.timelineEditor.setItemEndTime(currentEventId, currentEvent.action.params.tt);
    }
    var newLabel = thisobj._getTimelineEventLabel(currentEvent);
    thisobj.timelineEditor.renameItem(currentEventId, newLabel);
    thisobj.popup.hide();
  }

  this._onEventCancel = function() {
    thisobj.eventEditor.cancel();
    thisobj.popup.hide();
  }

  this._onEventDelete = function() {
    // if(confirm("Are you sure?")) {
    var currentEventId = thisobj.eventEditor.currentView.currentEvent._id;
    thisobj.timelineEditor.deleteItem(currentEventId);
    thisobj.player.story.removeTimelineEvent(currentEventId);
    // }
    thisobj.popup.hide();
  }

  this._onAddTimelineGroup = function() {
      var selectables = [];
      var currentGroups = thisobj.timelineEditor._getGroups();

      if(currentGroups.indexOf("subtitles")<0) {selectables.push("subtitles");}
      if(currentGroups.indexOf("trigger")<0) {selectables.push("trigger");}
      for(var i=0; i<thisobj.player.story.actors.length; i++) {
        if(currentGroups.indexOf(thisobj.player.story.actors[i].name)<0 && selectables.indexOf(thisobj.player.story.actors[i].name)<0) {
          selectables.push(thisobj.player.story.actors[i].name);
        }
      }
      for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
        if(currentGroups.indexOf(thisobj.player.story.audiotracks[i]._name)<0) {
          selectables.push(thisobj.player.story.audiotracks[i]._name);
        }
      }

      thisobj.assetSelector.setAssets(selectables);
      thisobj.popup.show(
        "Select",
        thisobj.assetSelector._container,
        null,
        [{name:"Cancel", handler:function() {thisobj.popup.hide();}}]
      );
  }
  this.timelineEditor.eventsManager.addListener("addtimelinegroup", this._onAddTimelineGroup);

  this._onAddTimelineGroupSelect = function(assetName) {
    thisobj.popup.hide();

    var maxId = thisobj.player.story.getMaxId();
    var timelineEvent = {
      _id: maxId+1,
      time: 0,
    };

    if(assetName=="subtitles") {
      timelineEvent.subtitle = {en:"text here"};
    } else if(assetName=="trigger") {
      timelineEvent.actor = assetName;
      timelineEvent.action = null;
    } else {
      //actor or audiotrack?
      var eventType = "other";
      for(var i=0; i<thisobj.player.story.actors.length; i++) {
        if(thisobj.player.story.actors[i].name==assetName) {
          eventType = "actor";
          break;
        }
      }
      for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
        if(thisobj.player.story.audiotracks[i]._name==assetName) {
          eventType = "audiotrack";
          break;
        }
      }
      if(eventType=="actor") {
        timelineEvent.actor = assetName;
        timelineEvent.action = {type:"show"};
      } else if(eventType=="audiotrack") {
        timelineEvent.audiotrack = assetName;
        timelineEvent.action = "play";
      }
    }
    thisobj.player.story.timeline.push(timelineEvent);
    thisobj.player.story._sortTimeline();
    thisobj.player.story._mapNamesToIndeces();
    thisobj.timelineEditor.addItem(timelineEvent._id, assetName, thisobj._getTimelineEventLabel(timelineEvent), timelineEvent.time, null);
    thisobj.timelineEditor._inflateGroups();
    if(assetName=="subtitles") {thisobj._onSubtitleChange();}
    console.log(assetName);
  }
  this.assetSelector.onselect = this._onAddTimelineGroupSelect;

  this._onSubtitleChange = function() {
    thisobj.player.story._findLanguages();
    thisobj._refreshLanguagesMenu();
  }
  this.eventEditor.eventsManager.addListener("subtitlechanged", this._onSubtitleChange);

  this._onAddActor = function(newActor) {
    thisobj.player.story.addActor(newActor);
    thisobj._inflateAssetsManager(thisobj.player.story);
  }
  this.assetsManager.eventsManager.addListener("addactor", this._onAddActor);

  this._onAddAudiotrack = function(newAudiotrack) {
    newAudiotrack.url = [newAudiotrack.url];
    thisobj.player.story.addAudiotrack(newAudiotrack);
    thisobj._inflateAssetsManager(thisobj.player.story);
  }
  this.assetsManager.eventsManager.addListener("addaudiotrack", this._onAddAudiotrack);

  this._onAssetRemove = function(assetDetails) {
    //Remove from timeline editor
    thisobj.timelineEditor.deleteGroup(assetDetails.name);
    //Remove from story
    if(assetDetails.type=="actor") {
      thisobj.player.story.removeActor(assetDetails.name);
    } else if(assetDetails.type=="audiotrack") {
      thisobj.player.story.removeAudiotrack(assetDetails.name);
    }
    thisobj.player.stop();
  }
  this.assetsManager.eventsManager.addListener("removeasset", this._onAssetRemove);

  this._onAssetUpdate = function(updatedAsset) {
    console.log(updatedAsset);
    var assetIndex = -1;
    var asset = null;
    if(updatedAsset.type=="actor") {
      var actors = thisobj.player.story.actors;
      for(var i=0; i<actors.length; i++) {
        if(actors[i].name==updatedAsset.name) {
          assetIndex = i;
          asset = actors[i];
          break;
        }
      }
      if(asset==null) {thisobj.log.error("Asset not found!", thisobj); return;}
      asset.x = asset.startX = asset._origin.x = updatedAsset.settings.x;
      asset.y = asset.startY = asset._origin.y = updatedAsset.settings.y;
      asset.z = asset.startZ = asset._origin.z = updatedAsset.settings.z;
      if(typeof updatedAsset.settings.motion!="undefined") {asset.motion = updatedAsset.settings.motion;}
      else if(typeof asset.motion!="undefined") {asset.resetMotion();}
      if(typeof updatedAsset.settings.sprite!="undefined") {asset.sprite = updatedAsset.settings.sprite;}
      else if(typeof asset.sprite!="undefined") {asset.sprite = null;}
      if(asset.url!=updatedAsset.settings.url) {
        asset._origin.url = updatedAsset.settings.url;
        asset.changeImage(updatedAsset.settings.url);
      }
      if(updatedAsset.name!=updatedAsset.settings.name) {
        asset.name = asset._origin.name = updatedAsset.settings.name;
        var timeline = thisobj.player.story.timeline;
        for(var i=0;i<timeline.length;i++) {
          if(timeline[i].actor==updatedAsset.name) {
            timeline[i].actor = updatedAsset.settings.name;
          }
        }
        thisobj.timelineEditor.renameGroup(updatedAsset.name, updatedAsset.settings.name);
      }
      asset._origin.url = asset.url;
      if(typeof asset.motion!="undefined" && asset.motion!=null) {asset._origin.motion = asset.motion;}
      if(typeof asset.sprite!="undefined" && asset.sprite!=null) {asset._origin.sprite = asset.sprite;}
    } else if(updatedAsset.type=="audiotrack") {
      var audiotracks = thisobj.player.story.audiotracks;
      for(var i=0; i<audiotracks.length; i++) {
        if(audiotracks[i]._name==updatedAsset.name) {
          assetIndex = i;
          asset = audiotracks[i];
          break;
        }
      }
      if(asset==null) {thisobj.log.error("Asset not found!", thisobj); return;}
      asset._volume = updatedAsset.settings.volume;
      if(updatedAsset.name!=updatedAsset.settings.name) {
        asset._name = asset._origin.name = updatedAsset.settings.name;
        var timeline = thisobj.player.story.timeline;
        for(var i=0;i<timeline.length;i++) {
          if(timeline[i].audiotrack==updatedAsset.name) {
            timeline[i].audiotrack = updatedAsset.settings.name;
          }
        }
        thisobj.timelineEditor.renameGroup(updatedAsset.name, updatedAsset.settings.name);
      }
    }
  }
  this.assetsManager.eventsManager.addListener("updateasset", this._onAssetUpdate);

  this._onKeydownGlobal = function(event) {
    if(window._dramaBlockGlobalKeys) {return;}
    if(event.keyCode==32) {
        if(thisobj.player.isPlaying()) {
          w2ui["layout_top_toolbar"].uncheck("playback-ctls-play");
          thisobj.player.pause();
        } else {
          w2ui["layout_top_toolbar"].check("playback-ctls-play");
          thisobj.player.play();
        }
    }
  }
}

},{"./../common/mod-log.js":3,"./../player/modules/player-main.js":33,"./assetselector/assetselector.js":7,"./assetsmanager/assetsmanager.js":8,"./eventeditor/eventeditor.js":11,"./loadhistory/loadhistory.js":15,"./popup/popup.js":16,"./storagehelper/storagehelper.js":17,"./storyglobalsettings/storyglobalsettings.js":18,"./timeline/timeline.js":19}],11:[function(require,module,exports){
module.exports = function(container) {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._SubtitleEditor = require("./mod-subtitleeditor.js");
  this._AudioEventEditor = require("./mod-audioeventeditor.js");
  this._ActorEventEditor = require("./mod-actoreventeditor.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this.currentView = null;
  this.subtitleEditor = new this._SubtitleEditor(this);
  this.audioEventEditor = new this._AudioEventEditor(this);
  this.actorEventEditor = new this._ActorEventEditor(this);
  this.eventsManager=new this._EventsManager();

  //--Elements--//

  //container
  this._container = (container==null || typeof container=="undefined")?document.createElement("div"):container;
  this._container.className = "event-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "padding:0; overflow-y:auto;"
  this._container.appendChild(this._containerBody);

  //--Functions--//

  this.editTimelineEvent = function(timelineEvent) {
    if(typeof timelineEvent.subtitle=="object") {
      //subtitle
      this.subtitleEditor.edit(timelineEvent);
      this._containerBody.innerHTML="";
      this.currentView = this.subtitleEditor;
      this._containerBody.appendChild(this.currentView._container);
    } else if(typeof timelineEvent.audiotrack=="string") {
      //audiotrack
      this.audioEventEditor.edit(timelineEvent);
      this.currentView = this.audioEventEditor;
      this._containerBody.innerHTML="";
      this._containerBody.appendChild(this.currentView._container);
    } else if(typeof timelineEvent.actor=="string") {
      this.actorEventEditor.edit(timelineEvent);
      this.currentView = this.actorEventEditor;
      this._containerBody.innerHTML="";
      this._containerBody.appendChild(this.currentView._container);
    }
  }

  this.save = function() {
    console.log("Save");
    if(this.currentView!=null) {
      this.currentView.save();
    }
  }

  this.cancel = function() {
    console.log("Cancel");
  }

}

},{"./../../common/mod-eventsmanager.js":2,"./mod-actoreventeditor.js":12,"./mod-audioeventeditor.js":13,"./mod-subtitleeditor.js":14}],12:[function(require,module,exports){
module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//

  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";
  this._container.style.cssText = "padding:0.5em";
  this._container.innerHTML = "Action ";
  //container > action selector
  this._actionSelect = document.createElement("select");
  this._actionSelect.innerHTML = "<option value='show'>Show</option>"+
                                  "<option value='hide'>Hide</option>"+
                                  "<option value='movelin'>Linear Movement</option>"+
                                  "<option value='movesin'>Sinusoid Movement</option>"+
                                  "<option value='teleport'>Teleportation</option>"+
                                  "<option value='fadein'>Fade In</option>"+
                                  "<option value='fadeout'>Fade Out</option>"+
                                  "<option value='fill'>Fill With Color</option>";
  this._actionSelect.onchange = function() {thisobj._showActionProperties(thisobj._actionSelect.value);}
  this._container.appendChild(this._actionSelect);
  this._container.appendChild(document.createElement("hr"));
  //container > properties container
  this._propertiesContainer = document.createElement("div");
  this._container.appendChild(this._propertiesContainer);
  //
  this._showProperties = new PropertyEditor([]);
  this._hideProperties = new PropertyEditor([]);
  this._movelinProperties = new PropertyEditor([{name:"tx", label:"Target X", type:"number"}, {name:"ty", label:"Target Y", type:"number"}], [{name:"tt", label:"Target T", type:"number"}]);
  this._movesinProperties = new PropertyEditor([{name:"tx", label:"Target X", type:"number"}, {name:"ty", label:"Target Y", type:"number"}], [{name:"tt", label:"Target T", type:"number"}]);
  this._teleportProperties = new PropertyEditor([{name:"x", label:"Target X", type:"number"}, {name:"y", label:"Target Y", type:"number"}, {name:"z", label:"Target Z", type:"number"}]);
  this._fillProperties = new PropertyEditor([{name:"color", label:"Color (Hex with #)"}]);
  this._fadeinProperties = new PropertyEditor([], [{name:"tt", label:"Target T", type:"number"}]);
  this._fadeoutProperties = new PropertyEditor([], [{name:"tt", label:"Target T", type:"number"}]);

  //--Functions--//

  this.edit = function(timelineEvent) {
    console.log(timelineEvent);
    if(timelineEvent!=null && typeof timelineEvent.actor=="string") {
      this.currentEvent = timelineEvent;
      var currentAction = timelineEvent.action.type;
      this._actionSelect.value = currentAction;
      var propertiesObject = this._getActionProperties(currentAction);
      if(currentAction=="movesin" || currentAction=="movelin") {
        propertiesObject.setValue("tx", timelineEvent.action.params.tx);
        propertiesObject.setValue("ty", timelineEvent.action.params.ty);
        propertiesObject.setValue("tt", timelineEvent.action.params.tt);
      } else if(currentAction=="teleport") {
        propertiesObject.setValue("x", timelineEvent.action.params.x);
        propertiesObject.setValue("y", timelineEvent.action.params.y);
        propertiesObject.setValue("z", timelineEvent.action.params.z);
      } else if(currentAction=="fill") {
        propertiesObject.setValue("color", timelineEvent.action.params.color);
      } else if(currentAction=="fadein") {
        propertiesObject.setValue("tt", timelineEvent.action.params.tt);
      } else if(currentAction=="fadeout") {
        propertiesObject.setValue("tt", timelineEvent.action.params.tt);
      }
      this._showActionProperties(currentAction);
    }
  }

  this._getActionProperties = function(action) {
    if(action=="movelin") {
      return this._movelinProperties;
    } else if(action=="movesin") {
      return this._movesinProperties;
    } else if(action=="teleport") {
      return this._teleportProperties;
    } else if(action=="fill") {
      return this._fillProperties;
    } else if(action=="fadein") {
      return this._fadeinProperties;
    } else if(action=="fadeout") {
      return this._fadeoutProperties;
    } else if(action=="show") {
      return this._showProperties;
    } else if(action=="hide") {
      return this._hideProperties;
    }
  }

  this._showActionProperties = function(action) {
    var propertiesObject = this._getActionProperties(action);
    this._propertiesContainer.innerHTML = "";
    this._propertiesContainer.appendChild(propertiesObject._container);
  }

  this.save = function() {
    this.currentEvent.action.type = this._actionSelect.value;
    var propertiesObject = this._getActionProperties(this.currentEvent.action.type);
    if(typeof this.currentEvent.action.params=="undefined") {this.currentEvent.action.params = {};}
    propertiesObject.exportValues(this.currentEvent.action.params);
    console.log(this.currentEvent);
  }

}

function PropertyEditor(properties, hiddenProperties) {

  thisobj = this;

  //--Variables--//

  this._inputs = [];

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "properties-editor";

  //--Functions--//

  this._init = function() {
    for(var i=0; i<properties.length; i++) {
      var type = "text";
      if(typeof properties[i].type!="undefined") {type = properties[i].type;}
      var input = this._createInput(properties[i].label, properties[i].name, type);
      this._container.appendChild(input);
    }
    if(hiddenProperties!=null) {
      for(var i=0; i<hiddenProperties.length; i++) {
        var type = "text";
        if(typeof hiddenProperties[i].type!="undefined") {type = hiddenProperties[i].type;}
        var input = this._createInput(hiddenProperties[i].label, hiddenProperties[i].name, type, true);
        this._container.appendChild(input);
      }
    }
  }

  this._createInput = function(label, name, type, hidden) {
    var labelElem = document.createElement("label");
    labelElem.style.cssText = "display:block;margin-bottom:0.2em";
    if(hidden==true) {labelElem.style.display = "none";}
    labelElem.innerHTML = label+" ";
    var inputElem = document.createElement("input");
    labelElem.appendChild(inputElem);


    var inputObject = {
      name: name,
      type: type,
      element: inputElem
    };
    this._inputs.push(inputObject);

    return labelElem;
  }

  this.setValue = function(name, value) {
    for(var i=0; i<this._inputs.length; i++) {
      if(this._inputs[i].name==name) {
        this._inputs[i].element.value=value;
        return;
      }
    }
  }

  this.exportValues = function(receiver) {
    for(var i=0; i<this._inputs.length; i++) {
      if(this._inputs[i].type=="number") {
        receiver[this._inputs[i].name] = this._inputs[i].element.value*1;
      } else {
        receiver[this._inputs[i].name] = this._inputs[i].element.value;
      }
    }
  }

  this._init();
}

},{}],13:[function(require,module,exports){
module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";
  this._container.style.cssText = "padding:0.5em";
  this._container.innerHTML = "Action ";
  //container > action selector
  this._actionSelect = document.createElement("select");
  this._actionSelect.innerHTML = "<option value='play'>Play</option><option value='stop'>Stop</option>";
  this._container.appendChild(this._actionSelect);

  this.edit = function(timelineEvent) {
    console.log(timelineEvent);
    if(timelineEvent!=null && typeof timelineEvent.action=="string") {
      this.currentEvent = timelineEvent;
      this._actionSelect.value = timelineEvent.action;
    }
  }

  this.save = function() {
    this.currentEvent.action = this._actionSelect.value;
  }

}

},{}],14:[function(require,module,exports){
module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "subtitle-editor";
  //container > subtitles container
  this._subtitlesContainer = document.createElement("div");
  this._subtitlesContainer.className = "subtitles";
  this._container.appendChild(this._subtitlesContainer);
  //container > footer
  this._footer = document.createElement("div");
  this._footer.className = "footer";
  this._footer.style.cssText = "padding:0.5em";
  this._container.appendChild(this._footer);
  //container > footer > add
  this._addButton = document.createElement("button");
  this._addButton.innerHTML = "Add";
  this._addButton.onclick = function(){thisobj._add();}
  this._footer.appendChild(this._addButton);

  //--Functions--//
  this.edit = function(timelineEvent) {
    this._subtitlesContainer.innerHTML = "";
    if(timelineEvent!=null && typeof timelineEvent.subtitle=="object") {
      this.currentEvent = timelineEvent;
      var items = Object.keys(timelineEvent.subtitle);
      for(var i=0; i<items.length; i++) {
        var newItem = new SingleLanguageEditor(items[i], timelineEvent.subtitle[items[i]]);
        this._subtitlesContainer.appendChild(newItem._container);
      }
    }
  }

  this.save = function() {
    var subtitles = {};
    var items = this._subtitlesContainer.getElementsByClassName("item");
    for(var i=0; i<items.length; i++) {
      var currentItem = items[i];
      var languageSelector = currentItem.getElementsByClassName("subtitle-language")[0];
      var language = languageSelector.options[languageSelector.selectedIndex].value;
      var textInput = currentItem.getElementsByClassName("subtitle-text")[0];
      subtitles[language] = textInput.value;
    }
    this.currentEvent.subtitle = subtitles;
    this._eventEditor.eventsManager.callHandlers("subtitlechanged");
  }

  this._add = function() {
    var newItem = new SingleLanguageEditor("en", "");
    this._subtitlesContainer.appendChild(newItem._container);
  }

}

function SingleLanguageEditor(language, subtitle) {

  var thisobj = this;

  //--Variables--//
  this._iso639_1 = ["ab","aa","af","ak","sq","am","ar","an","hy","as","av","ae","ay","az","bm","ba","eu","be","bn","bh","bi","bs",
                    "br","bg","my","ca","ch","ce","ny","zh","cv","kw","co","cr","hr","cs","da","dv","nl","dz","en","eo","et","ee",
                    "fo","fj","fi","fr","ff","gl","ka","de","el","gn","gu","ht","ha","he","hz","hi","ho","hu","ia","id","ie","ga",
                    "ig","ik","io","is","it","iu","ja","jv","kl","kn","kr","ks","kk","km","ki","rw","ky","kv","kg","ko","ku","kj",
                    "la","lb","lg","li","ln","lo","lt","lu","lv","gv","mk","mg","ms","ml","mt","mi","mr","mh","mn","na","nv","nd",
                    "ne","ng","nb","nn","no","ii","nr","oc","oj","cu","om","or","os","pa","pi","fa","pl","ps","pt","qu","rm","rn",
                    "ro","ru","sa","sc","sd","se","sm","sg","sr","gd","sn","si","sk","sl","so","st","es","su","sw","ss","sv","ta",
                    "te","tg","th","ti","bo","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa",
                    "cy","wo","fy","xh","yi","yo","za","zu"];

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "item";
  this._container.style.cssText = "padding:0.5em;";
  //container>language select
  this._languageSelector = document.createElement("select");
  this._languageSelector.className = "subtitle-language"
  this._languageSelector.style.cssText = "margin-right:0.5em";
  var content = "";
  for(var i=0; i<this._iso639_1.length; i++) {
    var isoLang = this._iso639_1[i]
    content+="<option value='"+isoLang+"' "+(isoLang==language?"selected":"")+">"+isoLang+"</option>";
  }
  this._languageSelector.innerHTML = content;
  this._container.appendChild(this._languageSelector);
  //container>subtitle input
  this._subtitleInput = document.createElement("input");
  this._subtitleInput.className = "subtitle-text";
  this._subtitleInput.style.cssText = "margin-right:0.5em";
  this._subtitleInput.setAttribute("value", subtitle);
  this._container.appendChild(this._subtitleInput);
  //container>delete
  this._deleteButton = document.createElement("button");
  this._deleteButton.innerHTML = "Delete";
  this._deleteButton.onclick = function() {thisobj._delete();}
  this._container.appendChild(this._deleteButton);

  //--Functions--//
  this._delete = function() {
    this._container.parentElement.removeChild(this._container);
  }

}

},{}],15:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this.log = require("./../../common/mod-log.js");
  this.Popup = require("./../popup/popup.js");

  //--Variables--//

  this._maxItems = 8;
  this._historyKey = "url-history";
  this._popup = new this.Popup();
  this._handler = null;

  //--Elements--//

  this._historyContainer = document.createElement("div");
  this._historyContainer.style.padding = "1em";

  //--Functions--//

  this.show = function(handler) {
      this._handler = handler;

      var history = this.getAll();

      this._historyContainer.innerHTML = "";
      for(var i=0; i<history.length; i++) {
          var item = document.createElement("a");
          item.innerHTML = history[i].url;
          item.style.display = "block";
          item.style.marginBottom = "0.5em";
          item.setAttribute("href","javascript:");
          item.onclick = thisobj._onItemClicked;
          this._historyContainer.appendChild(item);
      }
      this._popup.show(
          "History",
          this._historyContainer,
          600,
          [{name:"Cancel", handler:function(){thisobj._popup.hide();}}]
      );
  }

  this._onItemClicked = function () {
      if(thisobj._handler!=null) {
          thisobj._handler(this.innerHTML);
      }
      thisobj._popup.hide();
  }

  this.getAll = function() {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return [];
      }

      var serializedHistory = localStorage.getItem(this._historyKey);
      if(serializedHistory==null || serializedHistory=="") {
          serializedHistory = "[]";
      }

      var history = JSON.parse(serializedHistory);
      history.sort(this._sort);
      return history;
  }

  this.save = function(url) {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return;
      }

      var history = this.getAll();

      // Check if url is already in history
      var index = -1;
      for(var i=0; i<history.length; i++) {
          if(history[i].url==url) {
              index = i;
              break;
          }
      }

      if(index>=0) {
          history[index].date = new Date().getTime();
      } else {
          history.push(new HistoryObject(url));
      }
      history.sort(this._sort);

      // Remove surplus items
      while(history.length>this._maxItems) {
          if(history.length-1<0) {break;}
          history.splice(history.length-1, 1);
      }

      // Serialize & store
      serializedHistory = JSON.stringify(history);
      localStorage.setItem(this._historyKey, serializedHistory);
  }

  this.remove = function(url) {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return;
      }

      var history = this.getAll();

      // Find & remove
      for(var i=0; i<history.length; i++) {
          if(history[i].url==url) {
              history.splice(i, 1);
              break;
          }
      }

      // Serialize & store
      var serializedHistory = JSON.stringify(history);
      localStorage.setItem(this._historyKey, serializedHistory);
  }

  this._sort = function(a, b) {
      return b.date-a.date;
  }

}

function HistoryObject(url) {
    this.url = url;
    this.date = new Date().getTime();
}

},{"./../../common/mod-log.js":3,"./../popup/popup.js":16}],16:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._ResizeDetector = require("./../../common/mod-resizedetector.js");

  //--Variables--//
  this._visible = false;
  this._okHandler = null;
  this._cancelHandler = null;
  this.resizeDetector = new this._ResizeDetector();
  this._defaultKeyDownHandler = null;
  this._buttons = [];

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "popup-container";
  this._container.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(100,100,100,0.6); z-index:200";
  this._container.style.display = "none";
  //container > window
  this._windowElem = document.createElement("div");
  this._windowElem.className = "popup-window";
  this._windowElem.style.cssText = "position:relative; margin:auto; background-color:#f0f0f0; border-radius:3px; overflow-x:hidden; box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.4);";
  this._container.appendChild(this._windowElem);
  //container > window > titleContainer
  this._titleContainer = document.createElement("div");
  this._titleContainer.style.cssText ="width:100%; border-bottom:1px solid #e0e0e0;";
  this._windowElem.appendChild(this._titleContainer);
  //container > window > titleContainer > title
  this._titleElem = document.createElement("div");
  this._titleElem.style.cssText ="padding:0.5em";
  this._titleElem.innerHTML ="Popup";
  this._titleContainer.appendChild(this._titleElem);
  //container > window > body
  this._bodyElem = document.createElement("div");
  this._bodyElem.style.cssText ="width:100%;";
  this._windowElem.appendChild(this._bodyElem);
  //container > window > footer
  this._footer = document.createElement("div");
  this._footer.style.cssText ="padding:0.5em; text-align:right";
  this._windowElem.appendChild(this._footer);

  //--Functions--//

  this._init = function() {
    document.body.appendChild(this._container);
  }
  window.addEventListener("load", function() {thisobj._init();});

  this._positionWindow = function() {
    height = this._windowElem.offsetHeight;
    this._windowElem.style.marginTop = this._container.offsetHeight/2-height/2+"px";
  }
  window.addEventListener("resize", function() {if(thisobj._visible) {thisobj._positionWindow();}});
  this.resizeDetector.watchElement(this._windowElem);
  this._windowElem.onresize = function() {thisobj._positionWindow();}

  this.show = function(title, element, width, buttons) {
    if(this._visible==true) {this.hide();}
    this._visible = true;

    window._dramaBlockGlobalKeys = true;

    this._titleElem.innerHTML = title;
    this._bodyElem.innerHTML = "";
    this._bodyElem.appendChild(element);

    if(typeof width!="number") {width=500;}
    if(typeof height!="number") {height=400;}
    this._container.style.display = "block";
    this._windowElem.style.width = width+"px";
    this._positionWindow();

    if(typeof buttons.length=="number") {
      for(var i=0; i<buttons.length; i++) {
        var button = document.createElement("button");
        button.handler = buttons[i].handler;
        button.addEventListener('click', buttons[i].handler);
        button.style.marginLeft = "0.5em";
        button.innerHTML = buttons[i].name;
        this._footer.appendChild(button);
        this._buttons.push(button);
      }
    }

    if(typeof onOk=="function") {this._okHandler = onOk;}
    if(typeof onCancel=="function") {this._cancelHandler = onCancel;}

    this._defaultKeyDownHandler = window.onkeydown;
    window.onkeydown = this._onKeyDown;
  }

  this.hide = function() {
    window._dramaBlockGlobalKeys = false;
    this._visible = false;
    this._container.style.display = "none";
    window.onkeydown = this._defaultKeyDownHandler;
    for(var i=0; i<this._buttons.length; i++) {
      var button = this._buttons[i];
      button.removeEventListener('click', button.handler);
      button.remove();
    }
    this._buttons = [];
  }

  this._onKeyDown = function(event) {
    if(event.keyCode==27) {
      // thisobj._onCancel();
      thisobj.hide();
    }
    event.stopPropagation();
  }

  // this._onOK = function() {
  //   this.hide();
  //   if(typeof this._okHandler=="function") {this._okHandler();}
  // }
  // this._okButton.onclick = function() {thisobj._onOK();}
  //
  // this._onCancel = function() {
  //   this.hide();
  //   if(typeof this._cancelHandler=="function") {this._cancelHandler();}
  // }
  // this._cancelButton.onclick = function() {thisobj._onCancel();}

}

},{"./../../common/mod-resizedetector.js":5}],17:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//
  this.log = require("./../../common/mod-log.js");

  //--Variables--//

  this._logName = "Storage Helper";
  this._localStoryKey = "story";

  //--Elements--//
  this._exportAnchor = document.createElement("a");
  this._exportAnchor.setAttribute("download", "story.json");

  //--Functions--//

  this.save = function(story) {
    if(typeof(Storage)=="undefined") {
      this.log.error("Web Storage is not supported by this browser!", this);
      return;
    }

    if(story==null) {
      localStorage.removeItem(this._localStoryKey);
      return;
    }

    var serializedStory = this._serializeStory(story);
    localStorage.setItem(this._localStoryKey, serializedStory);
    this.log.message("Story saved to local storage.", this);
  }

  this.load = function() {
    var story = localStorage.getItem(this._localStoryKey);
    if(story!=null) {
      story = JSON.parse(story);
      this.log.message("Retrieved story from local storage.", this);
    } else {
      this.log.warning("No story found in the local storage.", this);
    }
    return story;
  }

  this.export = function(story) {
    var serializedStory = "data:text/json;charset=utf-8,";
    serializedStory += this._serializeStory(story);
    var encodedStory = encodeURI(serializedStory);

    this._exportAnchor.setAttribute("download", this._createFilename(story));
    this._exportAnchor.setAttribute("href", encodedStory);
    this._exportAnchor.click();
    this.log.message("Story exported.", this);
  }

  this._serializeStory = function(story) {
    var nakedStory = {
      format: story.format,
      title: story.title,
      width: story.width,
      height: story.height,
      actors: [],
      audiotracks: [],
      timeline: []
    };

    //cleanup timeline
    var timeline = JSON.parse(JSON.stringify(story.timeline));
    for(var i=0; i<timeline.length; i++) {
      delete timeline[i]._id;
    }
    nakedStory.timeline = timeline;

    //add actors
    for(var i=0; i<story.actors.length; i++) {
      if(story.actors[i]._origin!=null) {
        nakedStory.actors.push(story.actors[i]._origin);
      }
    }

    //add audiotracks
    for(var i=0; i<story.audiotracks.length; i++) {
      if(story.audiotracks[i]._origin!=null) {
        nakedStory.audiotracks.push(story.audiotracks[i]._origin);
      }
    }

    var serializedStory = JSON.stringify(nakedStory, null, " ");
    return serializedStory;
  }

  this._createFilename = function(story) {
    var title = story.title;
    var filename = "";
    for(var i=0; i<title.length; i++) {
      var letter = title[i];
      if(letter<"A" && letter>"z" && letter<"0" && letter>"9") {
        letter = "-";
      }
      filename += letter;
    }
    return filename+".json";
  }

}

},{"./../../common/mod-log.js":3}],18:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //--Variables--//

  this._settings = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "story-gs-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "story-gs-editor-body";
  this._containerBody.style.cssText = "padding:0.5em";
  this._container.appendChild(this._containerBody);
  //container > title
  this._containerBody.innerHTML += "Story Title ";
  this._storyTitle = document.createElement("input");
  this._storyTitle.style.marginBottom = "0.5em";
  this._storyTitle.setAttribute("name", "title");
  this._containerBody.appendChild(this._storyTitle);
  //container > width
  this._containerBody.innerHTML += "<br>Width ";
  this._storyWidth = document.createElement("input");
  this._storyWidth.style.marginBottom = "0.5em";
  this._storyWidth.setAttribute("name", "width");
  this._containerBody.appendChild(this._storyWidth);
  //container > height
  this._containerBody.innerHTML += "<br>Height ";
  this._storyHeight = document.createElement("input");
  this._storyHeight.style.marginBottom = "0.5em";
  this._storyHeight.setAttribute("name", "height");
  this._containerBody.appendChild(this._storyHeight);

  //--Functions--//


  this.setCurrentSettings = function(settings) {
    this._settings = settings;
    this._containerBody.children["title"].value = settings.title;
    this._containerBody.children["width"].value = settings.width;
    this._containerBody.children["height"].value = settings.height;
  }

  this.settingsChanged = function() {
    var results = this.getResult();
    if(this._settings.title!=results.title) {return true;}
    if(this._settings.width!=results.width) {return true;}
    if(this._settings.height!=results.height) {return true;}
    return false;
  }

  this.getResult = function() {
    var settings = {};
    settings.title = this._containerBody.children["title"].value;
    settings.width = this._containerBody.children["width"].value*1;
    settings.height = this._containerBody.children["height"].value*1;
    return settings;
  }

}

},{}],19:[function(require,module,exports){
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
  this._viewportScale = 0.5;
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

  this.setItemEndTime = function(id, time) {
    for(var i=0; i<this._items.length; i++) {
      if(this._items[i].id==id) {
        this._items[i].endTime = time;
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

},{"./../../common/mod-eventsmanager.js":2,"./tm-eventui.js":21,"./tm-timeindicator.js":22}],20:[function(require,module,exports){
module.exports = function(draggable, container, onDrag) {

  //--Variables--//

  var thisobj = this;
  this._startEvent = null;

  //--Init--//

  this._mouseDownWrapper = function(event){thisobj._onMouseDown(event);}
  this._mouseMoveWrapper = function(event){thisobj._onMouseMove(event);}
  this._mouseUpWrapper = function(event){thisobj._onMouseUp(event);}
  draggable.addEventListener("mousedown", this._mouseDownWrapper);
  container.addEventListener("mousemove", this._mouseMoveWrapper);
  container.addEventListener("mouseup", this._mouseUpWrapper);

  //--Functions--//

  this._destruct = function() {
    draggable.removeEventListener("mousedown", this._mouseDownWrapper);
    container.removeEventListener("mousemove", this._mouseMoveWrapper);
    container.removeEventListener("mouseup", this._mouseUpWrapper);
  }

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

},{}],21:[function(require,module,exports){
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
      this._dragEndTime = (this._timelineEvent.endTime<this._timelineEvent.startTime)?this._timelineEvent.startTime:this._timelineEvent.endTime;
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
    event.stopPropagation();
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

},{"./tm-draghelper.js":20}],22:[function(require,module,exports){
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

},{"./tm-draghelper.js":20}],23:[function(require,module,exports){
//////////// Actions ////////////
var actions={};

//teleport
actions.teleport = {
    init:function(player,actor){
      actor.x = actor.action.params.x;
      actor.y = actor.action.params.y;
      actor.z = actor.action.params.z;
    },
    act:function(t,actor,params) {
      actor.action = null;
    }
}

//fade in
actions.fadein = {
    init:function(player,actor){
      actor.action.params.context=player.context;
      actor.action.params.width=player.story.width;
      actor.action.params.height=player.story.height;
      actor.action.params.a=-1/(actor.action.params.tt-player.time);
      actor.action.params.b=-actor.action.params.a*actor.action.params.tt;
      actor.action.params.st=player.time;
      actor.action.params.freq=1/(2*(actor.action.params.tt-player.time));
    },
    act:function(t,actor,params){
      color=(1+Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      params.context.fillStyle="rgba(0,0,0,"+color+")";
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//fade out
actions.fadeout = {
    init:actions.fadein.init,
    act:function(t,actor,params){
      color=(1+Math.cos(drama.constants.PI360*(t-params.st)*params.freq+drama.constants.PI180))/2;
      params.context.fillStyle="rgba(0,0,0,"+color+")";
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//fill canvas with color
actions.fill = {
    init:function(player,actor){
      actor.action.params.context=player.context;
      actor.action.params.width=player.story.width;
      actor.action.params.height=player.story.height;
    },
    act:function(t,actor,params){
      params.context.fillStyle=params.color;
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//linear movement
actions.movelin = {
    init:function(player,actor){
      actor.action.params.ax=(actor.action.params.tx-actor.x)/(actor.action.params.tt-player.time);
      actor.action.params.ay=(actor.action.params.ty-actor.y)/(actor.action.params.tt-player.time);
      actor.action.params.bx=actor.x-actor.action.params.ax*player.time;
      actor.action.params.by=actor.y-actor.action.params.ay*player.time;
    },
    act:function(t,actor,params){
      actor.x=actor.action.params.ax*t+actor.action.params.bx;
      actor.y=actor.action.params.ay*t+actor.action.params.by;
      if(t>=actor.action.params.tt) {
        actor.x=params.tx;
        actor.y=params.ty;
        actor.action=null;
      }
    }
}

//sinusoid movement
actions.movesin = {
    init:function(player,actor){
      actor.action.params.st=player.time;
      actor.action.params.freq=1/(2*(actor.action.params.tt-player.time));
      actor.action.params.sy=actor.y;
      actor.action.params.dy=actor.y-actor.action.params.ty;
      actor.action.params.sx=actor.x;
      actor.action.params.dx=actor.x-actor.action.params.tx;
    },
    act:function(t,actor,params){
      actor.x=params.sx-params.dx*(1-Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      actor.y=params.sy-params.dy*(1-Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      if(t>=actor.action.params.tt) {
        actor.x=params.tx;
        actor.y=params.ty;
        actor.action=null;
      }
    }
}

module.exports=actions;

},{}],24:[function(require,module,exports){
module.exports={
  PI360:2*Math.PI,
  PI180:Math.PI,
  PI90:Math.PI/2
};

},{}],25:[function(require,module,exports){
var VolumeControl=require("./dp-volumecontrol.js");

//PlayerControls
module.exports = function(player) {
	//prototypes
	this.LanguageSelector = require("./dp-languageselector.js");

	this.player=player;
	this.showTime=0; //when the controls showed up
	this.showDuration=1000; //how much time the controls stay visible (ms)
	this.visible=true;
	this.muted=false;
	this.volumeBeforeMute=0;
	var thisobj=this;

	//assets
	var imgPlay = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAlCAYAAADFniADAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADPSURBVFiF3ddJDsIwEETRAnEvcjQ4GeFkxaqSSJns2D2IL/XGi9ZbukFyJDmQRJYB59Lglqg0uC1UOO4IFYYrQbnjalBuuCsoc1wLygx3R3tPAB8AI4Chw74uKNUN1xOlmnEWKHUZZ4lS1TgPlCrGeaLUKS4CpXZxkSi1wt1IMhC01fsRLVj0BfACMGZATRg9RKJWGBWB2sUoT9QpRnmgijHKElWNURaoyxjVE9WMmcr4R/+baybV3WeOqUG5YUpQ7pgjVBhmCxWOWaLSYDQ/Y5CQxtZTdJkAAAAASUVORK5CYII=";
	var imgPause = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAlCAYAAAC+uuLPAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA/SURBVFiF7c2xDQAgEMNAwxSw/3CwRdgAfUGF7DZSriUJtSawL/sAVuWoF8GniYqKioqKioqKioqKioqKfo8eMekGRuKWtU8AAAAASUVORK5CYII=";
	var imgStop = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACISURBVEiJ7dY7DoAwDANQl5OVm3E0OJmZkECE0o9DFix16dA3xWkiSdyTjLuRZAALaAeik0mu50c9sAvihZmIGisiKqwKGcWakF6sC2nFhpBaTIK8YVLkSCLNunLJ9BX0Y+7YDGCTa4WR+GzOQhokpBtDWj9kn4Vs6iZUjRVRL8xEn1aMy494BwOtRMWypfpyAAAAAElFTkSuQmCC";
	var imgFullscreen = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAhCAYAAACr8emlAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKESURBVFiFzdjri01RGMfxz3EdzJwhXihRxAt5hZQyOJH79e/wT/CeN/4NEVLKTHJCIiWUlESRSxqZq9tge7HW6eyOPTN7zzlb86vVs56193n296y19rPWXpUkSUTNx1qsxwp0Y8k0JeseGG8pYxltWfcM4iVeYwIqSZL0R6g1mGt26Dfe4GUlSXVhTo1jGCMpm65DFb3Rpuu9mr2cS/NS9c94FsnT5V18+DBG479rR3PRE2F7sUoYvXTZhOUgaepMkiRmSTnTgJrTZm+Urv8JWMVhnMXDWJ9W86a/Zcbqxk7UYtmqmSX+4F6eIGUBnsepKeI/wVCeQGUN8Wk8nuJ6PW+gsgCHsN/kkPW8gcp8SX4ISb1Vf3Anb5CyABfhGnZEfzR17Sm+5A1UBmADbk/0b2CjsEpRYHjpPGAXrmJv9AdwUlgu9+C5goCdTDMLcQX7on8TJ/A9+p8EyG9FgnYKcCEu40D06zieAfOxaOCiQ9yNZS1tC3AJh6J/G0fxtShMlooC7hbm1dIU3EUcif7dWM9KLzNSUcCasKb2C58FF3AsXrsnbADGOgVH8TlYi3YbXmgO931hiEczftOWivRgFZtTfgPuEQ5qbvc7qiKAfbI/qn7iV2dw/lURwNok7dtxHYvbpslQJwBhF861h5KtvC9JD7a0tL0QEnKjfOgUVFp5AfuEr/06bkX7vgygVuUFHMCGMkEmU945WNpbOp3SRx/vhJzWOFF4G+1HIceNau5M2lWXMK+rWCmcJqzWPFnYIpw4KHo2MxFBR6aw4oN7prDz8z6wkiTJA6wT1tbZpEG8qqQ6sCqANmCXCMk3bbPaWq8RtlqNc7+vk9istkG8imUE/gLhyCouJy5X6QAAAABJRU5ErkJggg==";
	var imgSoundOn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAYAAADKO/UvAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACYSURBVEiJ7ZWxDcIwFAXPyBIdBQ2ZgVHYgD0YAFbIBJmEMlOwBAOgowGEImEltkXlJ/3K+td8615QKUgEetTc2apXCwB79eYrOYCDevcrSwEn9eEkc5fX6jBdXgLZqeMvgGoEzokTdsAR2KTuHLTsowCsSgEN0iANkp8IXBLvs1RQRUp/02M1UVetjGrl9Z5PjQbLPB2B/gnl1KjffFx79AAAAABJRU5ErkJggg==";
	var imgSoundOff = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAcCAYAAACQ0cTtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFbSURBVEiJ7Za9SgNBFIXPJvYRBNGwBMHWSvAF/AFfwNJ38BVsrSRIihQpUij2lpIXEBQRRSKC9iIIWn8Wu4PXdf93GiEHLuzOnJlvd6a4R4AaVAAcAr0CXwdQE9A8cEGklRxfH5gCYV3QGvDEj9JgATAwnkkd0B7wyW8lYQEwNPPPQK8KpA0ckS4LawEjMzcFQirc2QJwmQGysDYwNuOPQNftUwa0DrzkgBysDZyasXtgye4l4KBgozJaBc7N+x2wmPzwOfnRiaTd+PlW0rakt6Sp5QnmQNeSNtNAPmGSdCVpS9J7lsHXMd5I2pH0kWfy9Wf7RSCfsK8yJp93NoPNYP8MdiwpiGtZ0oOZP5O0IenVC820gC5Rs3Maxz2qSvPMLfcQErVvpxFRe68TC3JhPaJA4jQkCixNAk8mbGIWDQpAVaJcKswdYb/MAlNlQ+qfO+tUBLkqG78F6BuExuTwOsjTqwAAAABJRU5ErkJggg==";

	//create elements
	this.container = document.createElement("div");
  this.container.style.cssText = "position:absolute;bottom:0;width:100%;text-align:center;";

	this.controlsPanel = document.createElement("div");
	this.controlsPanel.style.cssText = "display:inline-block;background-color:rgba(0,0,0,0.3);margin-bottom:2.5%;padding:5px 20px;border-radius:15px;"+
		"-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;";
	this.container.appendChild(this.controlsPanel);

	this.mainControlsElem = document.createElement("div");
	this.languageSelector = new this.LanguageSelector();
	this.languageSelector.onselect = function(langIndex) {
		thisobj.player.setLanguage(langIndex);
		thisobj.controlsPanel.innerHTML="";
		thisobj.controlsPanel.appendChild(thisobj.mainControlsElem);
	}
	this.player.eventsManager.addListener("ready",function() {
		if(thisobj.player.story.languages.length!=0) {
			thisobj.languageSelector.setLanguages(thisobj.player.story.languages);
			thisobj.languageIndicator.innerHTML = thisobj.player.story.languages[thisobj.player.getLanguage()];
		} else {
			thisobj.languageIndicator.innerHTML = "";
		}
	});
	this.controlsPanel.appendChild(this.mainControlsElem);
	//this.controlsElement.style.cssText="display:inline-block;background-color:rgba(200,200,200,.2);margin-bottom:3%;padding:5px 20px;border-radius:15px;"+
	//	 "-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;";

	var controlsCss = "display:inline-block;width:40px;height:40px;margin:0 1px;cursor:pointer;";

	//play
	this.playButton=document.createElement("div");
    this.playButton.style.cssText=controlsCss+"background:url("+imgPlay+") no-repeat center;";
	this.playButton.onclick=function() {
		if(thisobj.player.started==0) {
			thisobj.player.play();
			thisobj.playButton.style.backgroundImage="url("+imgPause+")";
		} else {
			thisobj.player.pause();
			thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
		}
	}

	//stop
	this.stopButton=document.createElement("div");
  this.stopButton.style.cssText = controlsCss+"background:url("+imgStop+") no-repeat center;";
	this.stopButton.onclick = function() {
		thisobj.player.stop();
		thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
	}

	//fullscreen
	this.fullscreenButton = document.createElement("div");
  this.fullscreenButton.style.cssText = controlsCss+"background:url("+imgFullscreen+") no-repeat center;";
	this.fullscreenButton.onclick = function() {thisobj.player.toggleFullscreen();}

	//mute
	this.muteButton=document.createElement("div");
    this.muteButton.style.cssText = controlsCss+"background:url("+imgSoundOn+") no-repeat center;";
	this.muteButton.onclick = function() {
		if(thisobj.muted) {
			thisobj.muted=false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
			thisobj.player.setVolume(thisobj.volumeBeforeMute);
		} else {
			thisobj.muted=true;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOff+")";
			thisobj.volumeBeforeMute = thisobj.volumeControl.value;
			thisobj.player.setVolume(0);
		}
	}

	//volume
	this.volumeControl=new VolumeControl(0);
	this.volumeControl.container.style.display="inline-block";
	this.volumeControl.onvaluechange=function(value) {
		if(thisobj.muted) {
			thisobj.muted = false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
		}
		thisobj.player.setVolume(value, false);
	}
	this.player.eventsManager.addListener("volumechange",function(volume) {
		if(volume!=0 && thisobj.muted==true) {
			thisobj.muted=false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
		}
		thisobj.volumeControl.setValue(volume);
	});

	//time indicator
	this.timeIndicator = document.createElement("span");
	this.timeIndicator.style.cssText = "color:#ccc;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;";
	this.timeIndicator.innerHTML = "00:00";

	//language indicator
	this.languageIndicator = document.createElement("span");
	this.languageIndicator.style.cssText = "color:#fff;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;cursor:pointer;";
	this.languageIndicator.onclick = function() {
		thisobj.controlsPanel.innerHTML="";
		thisobj.controlsPanel.appendChild(thisobj.languageSelector.container);
	}
	this.player.eventsManager.addListener("languagechange", function(langIndex){
		thisobj.languageIndicator.innerHTML = thisobj.player.story.languages[langIndex];
	});
	//this.languageIndicator.innerHTML = "en";

	//append controls
  this.mainControlsElem.appendChild(this.stopButton);
  this.mainControlsElem.appendChild(this.playButton);
	this.mainControlsElem.appendChild(this.timeIndicator);
  this.mainControlsElem.appendChild(this.muteButton);
	this.mainControlsElem.appendChild(this.volumeControl.container);
	this.mainControlsElem.appendChild(this.languageIndicator);
	this.mainControlsElem.appendChild(this.fullscreenButton);

	this.setTime=function() {
		var time=(thisobj.player.time/1000)|0;
		var seconds=time%60;
		var minutes=(time/60|0)%60;
		if(seconds<10) {seconds="0"+seconds;}
		if(minutes<10) {minutes="0"+minutes;}
		thisobj.timeIndicator.innerHTML=minutes+":"+seconds;
	}

	this.onmousemove=function() {
		thisobj.showTime=thisobj.player.time;
		if(!thisobj.visible) {
			thisobj.container.style.display="block";
			thisobj.player.playerElement.style.cursor="auto";
			thisobj.visible=true;
		}
	}

	this.refresh=function() {
		thisobj.setTime();
		if(thisobj.visible&&thisobj.player.time-thisobj.showTime>thisobj.showDuration) {
			thisobj.container.style.display="none";
			thisobj.player.playerElement.style.cursor="none";
			thisobj.visible=false;

			//if not already return to the main controls
			thisobj.controlsPanel.innerHTML="";
			thisobj.controlsPanel.appendChild(thisobj.mainControlsElem);
		}
		if(thisobj.player.started==0) {
			thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
		} else {
			thisobj.playButton.style.backgroundImage="url("+imgPause+")";
		}
	}

	setInterval(this.refresh,1000);
}

},{"./dp-languageselector.js":28,"./dp-volumecontrol.js":32}],26:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;
  this.items = new Array();

  this.add = function(actor) {
    //find new actor's position in queue
    var i=0;
    while((i<this.items.length)&&(actor.z>=this.items[i].z)) {i++;}
    //add the actor to the queue
    this.items.splice(i,0,actor);
  }

  this.remove = function(actor) {
    //find and remove the requested actor from the queue
    for(var i=0;i<this.items.length;i++) {
      if(this.items[i]==actor) {
        this.items.splice(i,1);
        return;
      }
    }
  }

  //Resets this draw queue
  this.reset = function() {
      this.items = new Array();
  }

  this.length = function() {
    return this.items.length;
  }

}

},{}],27:[function(require,module,exports){
//////////// _CelladoorDebugConsole ////////////

//Player Info Box
module.exports = function(player) {
  //function _CelladoorDebugConsole(player) {
  this.player=player;
  this._previousTotalFrames = 0;

  //create elements
  this.container=document.createElement("div");
  this.container.style.cssText="color:white;background-color:rgba(100,100,100,.8);margin:10px;padding:10px;min-width:300px;position:absolute;right:0px;text-align:left;z-index:1;display:none";
  this.container.innerHTML="<div style='float:left;'>Player Info</div><div style='float:right;'>version "+player.PLAYER_VERSION+"</div><div style='clear:both'></div>";
  this.fpsbox=document.createElement("div");
  this.fpsbox.style.cssText="float:right;font-size:110%;";
  this.timebox=document.createElement("div");
  this.timebox.style.cssText="border-top:1px dotted white;";
  this.messagepanel=document.createElement("div");
  this.messagepanel.style.cssText="font-family:Courier,monospace;margin-top:10px;border-top:1px dotted white;";
  this.container.appendChild(this.fpsbox);
  this.container.appendChild(this.timebox);
  this.container.appendChild(this.messagepanel);

  var thisobj=this;

  this.setFPS=function(fps){ //set the fps label
    thisobj.fpsbox.innerHTML=fps+"fps";
  }

  this.setTime=function(msec){ //set the time label
    thisobj.timebox.innerHTML="time: "+Math.floor(msec/100)/10+"sec";
  }

  this.msg_queue=new Array();
  this.msg_max=22; //maximum number of messages in the queue
  this.print=function(txt){ //add a message in the debug console
    thisobj.msg_queue.push(txt);
    if(thisobj.msg_queue.length>this.msg_max){thisobj.msg_queue.splice(0,1);}
    var txt_queue="";
    for(var i=0;i<thisobj.msg_queue.length;i++){txt_queue+=thisobj.msg_queue[i]+"<br/>";}
    this.messagepanel.innerHTML=txt_queue;
  }

  this.refresh=function(){
    var fps = thisobj.player.framesCounter - thisobj._previousTotalFrames;
    thisobj.setFPS(fps);
    thisobj.setTime(thisobj.player.time);
    thisobj._previousTotalFrames = thisobj.player.framesCounter;
  }

  setInterval(this.refresh,1000);
  this.setFPS(0);
  this.setTime(0);

  return this;
}

},{}],28:[function(require,module,exports){
module.exports = function() {

  var thisobj = this;

  //styles
  this._itemCss = "color:#fff;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;cursor:pointer;";

  //elements
  this.container = document.createElement("div");

  this.onselect = null;

  this.setLanguages = function(languages) {
      //clear the container
      this.container.innerHTML = "";
      //add the available languages
      for(var i=0;i<languages.length;i++) {
        var currentButton = document.createElement("span");
        currentButton.style.cssText = this._itemCss;
        currentButton.innerHTML = languages[i];
        currentButton.langIndex = i;
        currentButton.onclick = function() {
          if(thisobj.onselect!=null) {thisobj.onselect(this.langIndex);}
        }
        this.container.appendChild(currentButton);
      }
  }

}

},{}],29:[function(require,module,exports){
// Displays the story title, the loading progress and the player status
module.exports = function(player) {
  var thisobj=this;

  //assets
  this.backImg="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAABmJLR0QAWgBaAFphdX+ZAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMFABArTJDQ0QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJ0lEQVRIx+3SMQ0AAAgDMHjx73eY4CFpNbSTTMG5Vgu1UAvUQi2+WeLJEjFyEsxJAAAAAElFTkSuQmCC";

  this.container=document.createElement("div");
  this.container.style.cssText="color:rgba(255,255,255,0.7);background:url("+this.backImg+") repeat center;background-color:rgba(200,200,200,.1);position:absolute;top:0;left:0;bottom:0;right:0;";
  this.textElement=document.createElement("div");
  this.textElement.style.cssText="position:absolute;width:100%;vertical-align:middle;text-align:center;font-size:2em;";
  this.container.appendChild(this.textElement);
  this.set=function(content) {
    if(content!=null) {
	  this.textElement.style.top=this.container.clientHeight/2-this.textElement.clientHeight/2+"px";
      this.textElement.innerHTML=content;
      this.container.style.visibility="visible";
    } else {
      this.container.style.visibility="hidden";
    }
  }

  this.onresize=function() {
	  this.textElement.style.top=this.container.clientHeight/2-this.textElement.clientHeight/2+"px";
  }

  player.eventsManager.addListener("resize",function(){thisobj.onresize()})
}

},{}],30:[function(require,module,exports){
//////////// Motion Functions ////////////
module.exports={

  vsin:function(t,actor) {
    actor.motion.x=0;
    actor.motion.y=10*Math.sin(drama.constants.PI360*actor.motion.freq*t);
  },

  ellipse:function(t,actor) {
    actor.motion.x=10*Math.cos(drama.constants.PI360*actor.motion.freq*t);
    actor.motion.y=5*Math.sin(drama.constants.PI360*actor.motion.freq*t);
  },

  swing:function(t,actor) {
    actor.motion.r=actor.motion.amp*Math.sin(drama.constants.PI360*actor.motion.freq*t+actor.motion.phase);
    actor.motion.x=0;
    actor.motion.y=0;
  },

  rotate:function(t,actor) {
    actor.motion.r=drama.constants.PI360*actor.motion.freq*t+actor.motion.phase;
    actor.motion.x=0;
    actor.motion.y=0;
  },

  sprite:function(t,actor) {
    actor.motion.current++;
    if(actor.motion.current>actor.motion.frames) {actor.motion.current=0;}
  }

};

},{}],31:[function(require,module,exports){
//////////// SubtitleBox ////////////
module.exports = function() {
	this.container=document.createElement("div");
	this.container.style.cssText="position:absolute;bottom:0px;width:100%;text-align:center;";
	this.subtitleElement=document.createElement("span");
	this.subtitleElement.style.cssText="visibility:hidden;display:inline-block;margin:30px 30px 2% 30px;padding:5px 10px;max-width:90%;font-size:2em;font-family:sans-serif;"
																			+"color:rgba(255,255,255,0.8);text-shadow:-1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 1px 1px 0 rgba(0,0,0,0.5);";
	this.container.appendChild(this.subtitleElement);
	this.defaultDuration=4000;
	this.timer=null;
	var thisobj=this;

	this.setText=function(text,duration) {
		if(!duration) {duration=this.defaultDuration;}
		clearInterval(this.timer);
		this.timer=setInterval(thisobj.hide,duration);
		this.subtitleElement.innerHTML=text;
		thisobj.subtitleElement.style.visibility="visible";
	}

	this.hide=function() {
		clearInterval(thisobj.timer);
		thisobj.timer=null;
		thisobj.subtitleElement.innerHTML="";
		thisobj.subtitleElement.style.visibility="hidden";
	}

	this.setSize=function(em_size) {
		this.subtitleElement.style.fontSize = em_size+"em";
	}

}

},{}],32:[function(require,module,exports){
module.exports = function(value) {
	//create elements
	this.container=document.createElement("div");
	this.container.style.cssText="position:relative;overflow:hidden;cursor:pointer;width:100px;height:20px;margin:10px 0;background-color:rgba(0,0,0,0.5)";
	this.handleElem=document.createElement("div");
	this.handleElem.style.cssText="width:0;height:100%;background:#ddd;border-right:2px solid #fff";
	this.container.appendChild(this.handleElem);

	this.width=parseInt(this.container.style.width);
	this.mouseDown=false;
	this.onvaluechange=null;
	this.value=0;
	var thisobj=this;

	//Sets the current volume for this object but does not call the
	//volumechange listener
	this.setValue=function(value) {
		if(value<0) {value=0;}
		else if(value>1) {value=1;}
		this.handleElem.style.width=((this.width*value)|0)+"px";
		this.value=value;
	}

	this.container.onmousedown=function(event) {
		if(!event) {event=window.event;}
		thisobj.mouseDown=true;
		thisobj.onmousemove(event);
	}

	this.onmouseup=function(event) {
		if(!event) {event=window.event;}
		thisobj.mouseDown=false;
	}

	this.onmousemove=function(event) {
		if(!event) {event=window.event;}
		if(thisobj.mouseDown) {
			var relX=event.clientX-thisobj.getHorizontalOffset();
			if(relX>thisobj.width) {relX=thisobj.width;}
			thisobj.setValue(relX/thisobj.width);
			if(thisobj.onvaluechange!=null) {thisobj.onvaluechange(thisobj.value);}
		}
	}

	this.getHorizontalOffset=function() {
		var offset=(this.container.clientWidth-this.width)/2;
		var element=this.container;
		do {
			offset+=element.offsetLeft;
			element=element.offsetParent;
		} while(element!=null);
		return offset;
	}

	document.addEventListener("mousemove",thisobj.onmousemove);
	document.addEventListener("mouseup",thisobj.onmouseup);

	if(value) {this.setValue(value);}
}

},{}],33:[function(require,module,exports){
//author: ptrgast

//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.constants=require("./dp-constants.js");
drama.motion=require("./dp-motions.js");
drama.actions=require("./dp-actions.js");

//////////// The Player Object ////////////
module.exports = function(containerId, options) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log=require("./../../common/mod-log.js");
  this.EventsManager=require("./../../common/mod-eventsmanager.js");
  this.DrawQueue=require("./dp-drawqueue.js");
  this.MessagesBox=require("./dp-messagesbox.js");
  this.InfoBox=require("./dp-infobox.js");
  this.Controls=require("./dp-controls.js");
  this.SubtitleBox=require("./dp-subtitlebox.js");
  this.Story=require("./../../common/mod-story.js");
  this.OptionsManager=require("./../../common/mod-optionsmanager.js");
  this.ResizeDetector=require("./../../common/mod-resizedetector.js");

  //--prepare options--//
  this._defaultOptions = {
    showControls: true
  }

  //--variables--//
  this._logName = "Player";
  this.PLAYER_VERSION = "0.34.2";
  this.log.message("Version "+this.PLAYER_VERSION, this);
  this.eventsManager=new this.EventsManager();
  this.story=null;
  this.loadtotal=0;
  this.loadcounter=0;
  this.loaded=false;
  this.loadtimer;
  this._playbackRate = 1.0;
  this.time=0; //primary time variable (ms)
  this.mtime=0; //secondary time variable for maintaining motion when in soft-pause mode (ms)
  this.mtimesec=0; //secondary time in seconds
  this.starttime=0;
  this.mstarttime=0;
  this.tli=0; //timeline index
  this.drawQueue=new this.DrawQueue();
  this.framesCounter=0;
  this.started=0; //0:not started 1:softpause 2:started
  this.currentLanguage=0;
  this.volume=0.5;
  this.playerRatio=16/9;
  this.drawTimer;
  this.playbackProgressTimer = null;
  this.playbackProgressTimerInterval = 200;
  this.options = new this.OptionsManager(this._defaultOptions, options);
  this.resizeDetector = new this.ResizeDetector();

  //--functions--//

  //I18N functions
  this.setLanguage = function(li) {
    this.currentLanguage=li;
    this.eventsManager.callHandlers("languagechange",li);
  }
  this.getLanguage = function() {return this.currentLanguage;}
  this.getLanguageName = function() {return this.story.languages[this.currentLanguage];}
  this.getLanguages = function() {
    if(this.story!=null) {return this.story.languages;}
    else {return [];}
  }

  //--elements--//

  // player
  this.playerElement=(typeof containerId=="undefined" || containerId==null)?document.createElement("div"):document.getElementById(containerId);
  this.playerElement.className = "drama-player";
  this.playerElement.style.position="relative";
  this.playerElement.style.overflow="hidden";
  this.playerElement.style.backgroundColor="#000";
  // player > canvas-wrapper
  this.canvasWrapper=document.createElement("div");
  this.canvasWrapper.style.cssText="font-size:0px;text-align:center;";
  // player > canvas-wrapper > canvas
  this.canvas=document.createElement("canvas");
  this.canvas.style.cssText="background-color:#000;"
  this.canvas.innerHTML="<p>Sorry, your browser doesn't support the <code>&lt;canvas&gt;</code> element...</p>";
  this.info=new this.InfoBox(this);
  this.notificationbox=new this.MessagesBox(this);
  this.subtitlebox=new this.SubtitleBox();
  this.controlsbox=new this.Controls(this);
  this.playerElement.onmousemove=this.controlsbox.onmousemove; //Pass mousemove events to controlsbox
  this.canvasWrapper.appendChild(this.canvas);
  this.playerElement.appendChild(this.info.container);
  this.playerElement.appendChild(this.canvasWrapper);
  this.playerElement.appendChild(this.notificationbox.container);
  this.playerElement.appendChild(this.subtitlebox.container);
  if(this.options.get("showControls")==true) {this.playerElement.appendChild(this.controlsbox.container)};
  this.context=this.canvas.getContext("2d");

  //returns the current time
  this._now = function() {
    return new Date().getTime()*this._playbackRate;
  }

  //player & story dimensions
  this._onresize=function() {
    if(!this.isFullscreen) {
      this.playerWidth=this.playerElement.clientWidth;
      var requestedHeight = this.options.get("height");
      if(requestedHeight==null) {
        this.playerHeight = this.playerWidth/this.playerRatio;
        this.playerElement.style.height=this.playerHeight+"px";
      } else {
        this.playerElement.style.height = requestedHeight;
        this.playerHeight = this.playerElement.clientHeight;
      }
    } else {
      this.playerWidth=window.innerWidth;
      this.playerHeight=window.innerHeight;
      this.playerElement.style.height=this.playerHeight+"px";
    }

    //resize canvas
    this._computeCanvasSize(this.playerWidth, this.playerHeight);

    //set subtitles size
    var subsize = (((this.canvas.width/400)*0.9*10)|0)/10;
    this.subtitlebox.setSize(subsize);

    this.eventsManager.callHandlers("resize");
  }

  this._computeCanvasSize=function(containerWidth, containerHeight) {
    var containerRatio=containerWidth/containerHeight;

    if(this.story!=null) {
      var storyRatio=this.story.width/this.story.height;
      if(containerRatio>storyRatio) {
        this.canvas.height=containerHeight;
        this.canvas.width=containerHeight*storyRatio;
        this.canvasWrapper.style.paddingTop="0px";
      } else {
        this.canvas.width=containerWidth;
        this.canvas.height=containerWidth/storyRatio;
        this.canvasWrapper.style.paddingTop=(containerHeight-this.canvas.height)/2+"px";
      }
      scalefactor=this.canvas.width/this.story.width;
      this.context.scale(scalefactor,scalefactor);
    }
  }

  this.playerElement.onresize = function() {thisobj._onresize();}
  this.resizeDetector.watchElement(this.playerElement);
  this._onresize();

  window.addEventListener("resize",function() {
    if(thisobj.playerElement.scrollWidth!=thisobj.playerWidth) {
      thisobj._onresize();
    }
  });

  //loadStory()
  //Loads a new story to the player (url or story object)
  this.loadStory=function(source) {
    // stop playback
    if(this.started!=0) {
      this.stop();
      this.drawQueue.reset(); //stop resets the draw queue but add the default actor back in
      this.controlsbox.refresh();
    }

    this.eventsManager.callHandlers("loading");
    this.story=new this.Story();
    this.story.onprogress=this.refreshProgress;
    this.story.onload=function() {
      thisobj._onresize();
      thisobj.setVolume(thisobj.volume);
      thisobj.eventsManager.callHandlers("ready");
    }

    this.time=0;
    this.mtime=0;
    this.loaded=false;

    if(typeof source=="string") {
      this.story.load(source);
    } else {
      this.story.loadFromObject(source);
    }

    this.drawQueue.add(this.story.stagecurtain);
    this.drawQueue.add(this.story.viewport);
  }

  // play()
  // Starts the story playback.
  this.play=function(){
    //set the time variables
    if(this.started!=2) {this.eventsManager.callHandlers("play");}
    this.started=2;
    if(this.loaded) {this.notificationbox.set();}
    else {this.log.warning("Story not loaded!");}
    this.starttime=this._now()-this.time;
    this.mstarttime=this._now()-this.mtime;
    //play audio tracks
    for(trki=0;trki<this.story.audiotracks.length;trki++) {
      if(this.story.audiotracks[trki].isActive()) {this.story.audiotracks[trki].play();}
    }
    //start the playback progress timer
    this.playbackProgressTimer = setInterval(thisobj._onPlaybackTimeChange, this.playbackProgressTimerInterval);
  }

  //pause()
  //Pauses the story playback.
  this.pause=function(){
    //stop drawing
    if(this.started!=0) {this.eventsManager.callHandlers("pause");}
    this.started=0;
    this.notificationbox.set("paused");
    //pause audio tracks
    for(trki=0;trki<this.story.audiotracks.length;trki++) {
      if(this.story.audiotracks[trki].isActive()) {this.story.audiotracks[trki].pause();}
    }
    //stop the playback progress timer
    if(this.playbackProgressTimer!=null) {
      clearInterval(this.playbackProgressTimer);
      this.playbackProgressTimer = null;
    }
  }

  //softpause()
  //Pauses the actions. Actors' motion remains active.
  this._softpause=function(){this.started=1;}

  //stop()
  //Goes back to the beginning of the story and stops playback
  this.stop=function() {
    this.started=0;
    this.tli=0;
    this.time=0;
    this.mtime=0;
    this.mtimesec=0;
    this.starttime=0;
    this.mstarttime=0;
    this.framesCounter = 0;
    //clear the actors queue (keep only the stagecurtain and the viewport)
    this.drawQueue.reset();
    this.drawQueue.add(this.story.stagecurtain);
    this.drawQueue.add(this.story.viewport);
    //stop audio tracks
    for(trki=0;trki<this.story.audiotracks.length;trki++) {
      if(this.story.audiotracks[trki].active) {
		      this.story.audiotracks[trki].audioElement.pause();
		      this.story.audiotracks[trki].audioElement.currentTime=0;
		      this.story.audiotracks[trki].active=false;
	    }
    }
    //reposition actors/rewind audiotracks
    this.story.resetActors();
    this.story.resetAudiotracks();
    //clear & reset canvas
	  //this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillStyle="rgba(0,0,0,255)";
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
	  //show story title
	  this.notificationbox.set(this.story.title);
    this.eventsManager.callHandlers("stop");
    //stop the playback progress timer
    if(this.playbackProgressTimer!=null) {
      clearInterval(this.playbackProgressTimer);
      this.playbackProgressTimer = null;
    }
  }

  //seek()
  //Jumps to specific time in the story
  this.seek=function(newTime) {
    if(!this.loaded) {
      this.log.warning("Seek canceled because the story is not loaded yet.", this);
      return;
    }
    this.log.message("Skipping to "+newTime+"...",this);
    //stop the playback
    var currentState=this.started;

    //Reset everything
    this.started=0;
    this.tli=0;
    this.time=0;
    this.mtime=0;
    this.mtimesec=0;
    this.starttime=0;
    this.mstarttime=0;
    //clear the actors queue (keep only the stagecurtain and the viewport)
    this.drawQueue.reset();
    this.drawQueue.add(this.story.stagecurtain);
    this.drawQueue.add(this.story.viewport);
    //reposition actors to their initial position
    this.story.resetActors();
    //pause all audiotracks
    for(var i=0;i<this.story.audiotracks.length;i++) {
      var audiotrack = this.story.audiotracks[i];
      //if(audiotrack.isActive()) {audiotrack.pause();}
      audiotrack.pause();
    }

    while(this.tli<this.story.timeline.length&&newTime>=this.story.timeline[this.tli].time) {
      var currentEvent = this.story.timeline[this.tli];
      this.time = currentEvent.time;
      if(currentEvent.action=="show") {
        //Add the actor to the drawing queue according to the z factor
        var actor=this.story.actors[currentEvent.index];
        this.drawQueue.add(actor);
      } else if(currentEvent.action=="hide") {
        //Remove the actor from the drawing queue
        var actor=this.story.actors[currentEvent.index];
        this.drawQueue.remove(actor);
      } else if(currentEvent.action!=null && currentEvent.action.params!=null && currentEvent.action.params.tx!=null) {
        var actor = this.story.actors[currentEvent.index];
        if(currentEvent.action.params.tt<newTime) {
          //It ends before the new time. Move the actor to tx,ty
          actor.x = currentEvent.action.params.tx;
          actor.y = currentEvent.action.params.ty;
          console.log("new position for "+actor.name+" ("+actor.x+", "+actor.y+")");
        } else {
          //It's an ongoing event
          actor.action = currentEvent.action;
          drama.actions[actor.action.type].init(this,actor);
          drama.actions[actor.action.type].act(newTime,actor,actor.action.params);
          console.log("new action for "+actor.name+" ("+currentEvent.action.type+" start-time:"+this.time+")");
          console.log("new position for "+actor.name+" ("+actor.x+", "+actor.y+")");
        }
      } else if(currentEvent.audiotrack!=null && currentEvent.action=="play") {
        var audiotrack = this.story.audiotracks[currentEvent.index];
        if(currentEvent.time+audiotrack.getDuration()>newTime) {
          //Found an ongoing audiotrack
          audiotrack.play();
          if(currentState==0) {audiotrack.pause();}
          audiotrack.seek(newTime-currentEvent.time);
        }
      } else if(currentEvent.audiotrack!=null && currentEvent.action=="stop") {
        var audiotrack = this.story.audiotracks[currentEvent.index];
        audiotrack.stop();
      }
      this.tli++;
    }

    //Stop the audiotracks that remained paused
    for(var i=0;i<this.story.audiotracks.length;i++) {
      var audiotrack = this.story.audiotracks[i];
      if(audiotrack.isPaused()) {audiotrack.stop();}
    }

    //set the time variables
    this.time = newTime;
    this.starttime = this._now() - this.time;
    this.mstarttime = this.starttime;

    console.log("start time:"+this.starttime+", playback time:"+this.time);

    //notify listeners for the time change
    thisobj.eventsManager.callHandlers("playbacktimechange", {time:this.time, forced:true});

    //continue
    this._drawActors();
    this.started=currentState;
  }

  this.isPlaying = function() {
    return this.started==2;
  }

  //setVolume()
  //Sets the master volume of the player
  this.setVolume=function(volume, triggerEvent) {
    this.volume=volume;
    for(trki=0;trki<this.story.audiotracks.length;trki++) {
      //if(this.story.audiotracks[trki].isActive()) {this.story.audiotracks[trki].audioElement.volume=this.story.audiotracks[trki].volume*volume;}
      this.story.audiotracks[trki].setVolume(volume);
    }
    //volumechange event
    if(typeof triggerEvent=="undefined") {triggerEvent=true;}
    if(triggerEvent) {
        this.eventsManager.callHandlers("volumechange",volume);
    }
  }

  //refreshProgress()
  //Prints the loading progress on the notification box.
  this.refreshProgress=function(assetsLoaded, totalAssets) {
    var progress=assetsLoaded/totalAssets*100|0;
    thisobj.notificationbox.set("loading... "+progress+"%");
    thisobj.log.message(assetsLoaded+"/"+totalAssets, thisobj);
    if(assetsLoaded>=totalAssets) {
      thisobj.loaded=true;
      if(thisobj.started==0) {thisobj.notificationbox.set(thisobj.story.title);}
	  else {thisobj.notificationbox.set();}
    }
  }

  //getPlayerElement()
  //Returns the root container.
  this.getPlayerElement=function() {//returns the player element
    return this.playerElement;
  }

  //draw()
  //This function is responsible for drawing the story.
  this.draw=function(){
    if(this.loaded&&this.started>0) {
      this.mtime=this._now()-this.mstarttime;
      this.mtimesec=this.mtime/1000;

      if(this.started>1) {
        this.time=this._now()-this.starttime;
        //timeline
        while(this.tli<this.story.timeline.length&&this.time>=this.story.timeline[this.tli].time) {
          //this.info.print("timeline action at "+this.time);
          if(typeof this.story.timeline[this.tli].action=="object" && this.story.timeline[this.tli].action!=null && this.story.timeline[this.tli].action.type=="show") {
            //add the actor to the drawing queue according to the z factor
            var actor=this.story.actors[this.story.timeline[this.tli].index];
            this.drawQueue.add(actor);
          } else if(typeof this.story.timeline[this.tli].action=="object" && this.story.timeline[this.tli].action!=null && this.story.timeline[this.tli].action.type=="hide") {
            //remove the actor from the drawing queue
            var actor=this.story.actors[this.story.timeline[this.tli].index];
            this.drawQueue.remove(actor);
          } else if(this.story.timeline[this.tli].action=="play") {
            var track=this.story.audiotracks[this.story.timeline[this.tli].index];
            track.setVolume(this.volume);
            track.play();
          } else if(this.story.timeline[this.tli].action=="stop") {
            var track=this.story.audiotracks[this.story.timeline[this.tli].index];
            track.stop();
          } else if(this.story.timeline[this.tli].action!=null&&this.story.timeline[this.tli].actor!=null) {
            var actor=this.story.actors[this.story.timeline[this.tli].index];
            actor.action=this.story.timeline[this.tli].action;
            drama.actions[actor.action.type].init(this,actor);
          } else if(this.story.timeline[this.tli].action!=null&&this.story.timeline[this.tli].audiotrack!=null) {
            var track=this.story.audiotracks[this.story.timeline[this.tli].index];
            track.action=this.story.timeline[this.tli].action;
          } else if(this.story.timeline[this.tli].subtitle!=null) {
            var subtitle=this.story.timeline[this.tli].subtitle;
            var lang=this.story.languages[this.currentLanguage];
            if(typeof subtitle[lang]!="undefined") {
              this.subtitlebox.setText(subtitle[lang], subtitle.duration);
            }
          }
          this.tli++;
          if(this.tli>=this.story.timeline.length) { //end of story
  			    if(this.controlsbox) {this.controlsbox.stopButton.onclick();}
  			    else {this.stop();}
            this.log.message("Story ended.",this);
  			    return;
          }
        }
      }

      //draw actors
      this._drawActors();
      this.framesCounter++;
    }
  }

  this._drawActors = function() {
    for(var i=0;i<this.drawQueue.items.length;i++) {
      var currentActor = this.drawQueue.items[i];
      if(currentActor.motion.type!=null) {drama.motion[currentActor.motion.type](this.mtimesec,currentActor);}
      if(currentActor.action!=null&&this.started==2) {drama.actions[currentActor.action.type].act(this.time,currentActor,currentActor.action.params);}
      if(currentActor.image!=null) {
        this.context.save();
        this.context.translate((currentActor.x+currentActor.motion.x-this.story.viewport.x-this.story.viewport.motion.x)*currentActor.z+currentActor.image.width*0.5,
                               (currentActor.y+currentActor.motion.y-this.story.viewport.y-this.story.viewport.motion.y)*currentActor.z+currentActor.image.height*0.5);
        if(this.drawQueue.items[i].motion.type!=null&&this.drawQueue.items[i].motion.r!=null) {this.context.rotate(this.drawQueue.items[i].motion.r);}
        //draw sprites
        if(this.drawQueue.items[i].sprite!=null) {
          this.context.drawImage(this.drawQueue.items[i].image,
                                 this.drawQueue.items[i].sprite.current*this.drawQueue.items[i].sprite.width,0,this.drawQueue.items[i].sprite.width,this.drawQueue.items[i].sprite.height,
                                 -this.drawQueue.items[i].sprite.width*0.5,-this.drawQueue.items[i].sprite.height*0.5,this.drawQueue.items[i].sprite.width,this.drawQueue.items[i].sprite.height);
          this.drawQueue.items[i].sprite.current=((this.drawQueue.items[i].sprite.frames/this.drawQueue.items[i].sprite.period*this.mtime)%this.drawQueue.items[i].sprite.frames)|0;
        }
        //draw static images
        else {this.context.drawImage(this.drawQueue.items[i].image,-this.drawQueue.items[i].image.width*0.5,-this.drawQueue.items[i].image.height*0.5);}
        this.context.restore();
      }
    }
  }

  //setTargetFPS()
  //Sets an upper limit for the playback FPS.
  this.setTargetFPS=function(tfps) {
    clearInterval(this.drawTimer);
    this.drawTimer=setInterval(function(){thisobj.draw();},1000/tfps);
  }

  //setFullscreen()
  this.setFullscreen=function(fullscreen) {
	if(fullscreen) {
      //go fullscreen
      if(this.playerElement.requestFullscreen) {this.playerElement.requestFullscreen();}
      else if(this.playerElement.webkitRequestFullscreen) {this.playerElement.webkitRequestFullscreen();}
      else if(this.playerElement.mozRequestFullScreen) {this.playerElement.mozRequestFullScreen();}
      else if(this.playerElement.msRequestFullscreen) {this.playerElement.msRequestFullscreen();}
	} else {
      if(document.exitFullscreen) {document.exitFullscreen();}
	  else if(document.msExitFullscreen) {document.msExitFullscreen();}
	  else if(document.mozCancelFullScreen) {document.mozCancelFullScreen();}
	  else if(document.webkitExitFullscreen) {document.webkitExitFullscreen();}
	}
  }

  //toggleFullscreen()
  this.toggleFullscreen=function() {
	if(this.isFullscreen) {this.setFullscreen(false);}
	else {this.setFullscreen(true);}
  }

  //fullscreenHandler()
  this.isFullscreen=false;
  this.fullscreenHandler=function() {
	   if(document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement||document.fullscreenElement) {
       //gone fullscreen
       thisobj.log.message("going fullscreen... ["+window.innerWidth+","+window.innerHeight+"]");
       thisobj.isFullscreen=true;
     } else {
       //exited fullscreen
       thisobj.isFullscreen=false;
     }
     thisobj._onresize();
  }

  //Register fullscreen events listener
  document.addEventListener("webkitfullscreenchange",thisobj.fullscreenHandler);
  document.addEventListener("mozfullscreenchange",thisobj.fullscreenHandler);
  document.addEventListener("MSFullscreenChange",thisobj.fullscreenHandler);
  document.addEventListener("fullscreenchange",thisobj.fullscreenHandler);

  this.printPlaybackStatus = function() {
    this.log.message("Current time: "+this.time+"ms", this);
    this.log.message("Draw queue: "+this.drawQueue.items.length, this);
    for(var i=0;i<this.drawQueue.items.length;i++) {
      var drawable = this.drawQueue.items[i];
      var output = "["+i+"] "+drawable.name;
      output += "("+drawable.x+", "+drawable.y+", "+drawable.z+") ";
      if(drawable.action) {
        output += "#("+drawable.action.type+" ";
        for(var paramName in drawable.action.params) {
          output += paramName+":"+drawable.action.params[paramName]+" ";
        }
        output +=")";
      }
      this.log.message(output, this);
    }
  }

  //showInfo()
  //Shows the info box.
  this.showInfo=function() {this.info.container.style.display="block";}

  //hideInfo()
  //Hides the info box.
  this.hideInfo=function() {this.info.container.style.display="none";}

  this._onPlaybackTimeChange = function() {
    thisobj.eventsManager.callHandlers("playbacktimechange", {time:thisobj.time, forced:false});
  }

  this.drawTimer=setInterval(function(){thisobj.draw();},25);
}


//////////// Particle ////////////
drama.Particle=function() {
  this.x=0;
  this.y=0;
  this.z=0;
  this.r=0;
  this.xspeed=0;
  this.yspeed=0;
  this.rspeed=0;
  this.rndfactor=0;
  this.width=0;
  this.height=0;
  return this;
}

//drop
function drop(t,actor,params) {
  for(i=0;i<params.particles.length;i++){
    params.particles[i].x+=(params.speed*Math.sin(params.angle)+params.randomness*Math.sin(params.particles[i].z*t/2000+params.particles[i].rndfactor));
    params.particles[i].y-=(params.speed*Math.cos(params.angle)+params.randomness*Math.cos(params.particles[i].z*t/2000+params.particles[i].rndfactor));
    params.particles[i].r+=(params.particles[i].rspeed*params.randomness);
    //draw particles
    params.context.save();
    params.context.translate((params.particles[i].x-params.viewport.x-params.viewport.motion.x)*params.particles[i].z,
                             (params.particles[i].y-params.viewport.y-params.viewport.motion.y)*params.particles[i].z);
    params.context.rotate(params.particles[i].r);
    x=(0.5 + (-params.image.width*0.5)) | 0;
    y=(0.5 + (-params.image.height*0.5)) | 0;
    params.context.drawImage(actor.image,x,y,actor.image.width,actor.image.height);
    //params.context.drawImage(actor.image,-params.image.width*.5,-params.image.height*.5,params.particles[i].width,params.particles[i].height);
    params.context.restore();
    if((params.particles[i].y-params.viewport.y-params.viewport.motion.y)*params.particles[i].z>params.storyheight) {
      params.particles[i].y=params.viewport.y-params.storyheight*Math.random();
      params.particles[i].x=params.viewport.x+params.storywidth*Math.random();
    }
  }
}

},{"./../../common/mod-eventsmanager.js":2,"./../../common/mod-log.js":3,"./../../common/mod-optionsmanager.js":4,"./../../common/mod-resizedetector.js":5,"./../../common/mod-story.js":6,"./dp-actions.js":23,"./dp-constants.js":24,"./dp-controls.js":25,"./dp-drawqueue.js":26,"./dp-infobox.js":27,"./dp-messagesbox.js":29,"./dp-motions.js":30,"./dp-subtitlebox.js":31}]},{},[10]);
