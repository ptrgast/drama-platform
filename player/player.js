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

},{}],8:[function(require,module,exports){
module.exports={
  PI360:2*Math.PI,
  PI180:Math.PI,
  PI90:Math.PI/2
};

},{}],9:[function(require,module,exports){
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

},{"./dp-languageselector.js":12,"./dp-volumecontrol.js":16}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./../../common/mod-eventsmanager.js":2,"./../../common/mod-log.js":3,"./../../common/mod-optionsmanager.js":4,"./../../common/mod-resizedetector.js":5,"./../../common/mod-story.js":6,"./dp-actions.js":7,"./dp-constants.js":8,"./dp-controls.js":9,"./dp-drawqueue.js":10,"./dp-infobox.js":11,"./dp-messagesbox.js":13,"./dp-motions.js":14,"./dp-subtitlebox.js":15}],18:[function(require,module,exports){
//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Player = require("./modules/player-main.js");

},{"./modules/player-main.js":17}]},{},[18]);
