(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//////////// AudioTrack ////////////
//module.exports = function(player,name,url,volume) {
module.exports = function(trackInfo, onload, assetsPath) {
  var thisobj=this;
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
  var thisobj=this;
  this.STATUS_NOT_LOADED=0;
  this.STATUS_LOADING=1;
  this.STATUS_LOADED=2;

  this.log=require("./mod-log.js");
  this.AudioTrack=require("./mod-audiotrack.js");
  this._logName="Story";
  this._status=this.STATUS_NOT_LOADED;
  this._assetsPath="";
  this._loadCounter=0;
  this._totalAssets=0;

  this.title="Untitled";
  this.width=0;
  this.height=0;
  this.actors=[];
  this.audiotracks=[];
  this.timeline=[];
  this.languages=[];

  //Create the system actors
  this.trigger=new MovableObject().initWithZ("trigger",9997);
  this.stagecurtain=new MovableObject().initWithZ("stagecurtain",9998);
  this.viewport=new MovableObject().initWithZ("viewport",9999);

  /** Loads a story from a URL. If you provide the assetsPath then every asset
  URL will be prefixed with this path **/
  this.load=function(url,assetsPath) {
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
    if(typeof assetsPath!="undefined") {this._assetsPath=assetsPath;}
    var request=new XMLHttpRequest();
    request.open("GET",url);

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

  /** Reads the parsed json response and prepares the assets **/
  this._handleResponse=function(story) {
    this._loadCounter=0;

    //First things first. Check the story format
    if(typeof story.format=="undefined" || story.format!="p316") {
      //TODO unsupported story! handle this event
      return;
    }

    this._totalAssets=story.actors.length+story.audiotracks.length
    this.title=story.title;
    this.width=story.width;
    this.height=story.height;

    //Load actor images
    for(var i=0;i<story.actors.length;i++) {
      story.actors[i] = new MovableObject().initWithActor(
        story.actors[i],
        function() {thisobj._assetLoaded();},
        this._assetsPath
      );
    }

    //Load audio tracks
    for(var i=0;i<story.audiotracks.length;i++) {
        story.audiotracks[i]=new this.AudioTrack(
          story.audiotracks[i],
          function() {thisobj._assetLoaded();},
          this._assetsPath
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

    this._findLanguages();
  }

  this._sortTimeline = function() {
    this.timeline.sort(function(event1,event2) {
      return event1.time-event2.time;
    });
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

}

//////////// MovableObject ////////////
function MovableObject() {
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
    if(typeof assetsPath=="undefined") {assetsPath="";}
    this.image.src=assetsPath+actor.url;
    //add the motion object
    if(typeof actor.motion=="undefined") {
      this.motion = {"type":null,"freq":0,"x":0,"y":0,"r":0};
    } else {
      this.motion = actor.motion;
    }
    return this;
  }

  this.resetPosition =  function() {
    this.x = this.startX;
    this.y = this.startY;
    this.z = this.startZ;
  }
}

},{"./mod-audiotrack.js":1,"./mod-log.js":3}],6:[function(require,module,exports){
//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/mod-log.js");
  this.StoryManager = require("./storymanager/storymanager.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.EventEditor = require("./eventeditor/eventeditor.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.9";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player(null, {showControls:false, height:"100%"});
  this.timelineEditor = new this.TimelineEditor();
  this.eventEditor = new this.EventEditor();

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
    var rightStyle = layoutStyle + "background-color:#444;";
    var bottomStyle = layoutStyle + "background-color:#222;";
    $("#"+containerId).w2layout({
      name: 'layout',
      padding: 4,
      panels: [
        { type: 'top', size: 30, resizable: false, style: layoutStyle, toolbar: thisobj.toolbar },
        { type: 'main', style: mainStyle, content: thisobj.player.playerElement},
        { type: 'right', size: 300, resizable: true, style: rightStyle, content: "right content" },
        { type: 'bottom', size: 300, resizable: true, style: bottomStyle, content: thisobj.timelineEditor._container }
      ],
      onResize: thisobj._layoutResizeHandler
    });
  }

  //init the top toolbar
  this._initToolbar = function() {
    this.toolbar = {
      name: "topbar",
    	items: [
    		{ type: 'check',  id: 'item1', caption: 'Check', img: 'icon-page', checked: true },
    		{ type: 'break',  id: 'break0' },
    		{ type: 'menu',   id: 'item2', caption: 'Drop Down', img: 'icon-folder', items: [
    			{ text: 'Item 1', icon: 'icon-page' },
    			{ text: 'Item 2', icon: 'icon-page' },
    			{ text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
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
    		{ type: 'button',  id: 'item5',  caption: 'Item 5', icon: 'fa-home' }
    	],
      onClick: function(event) {
        if(event.item.id=="playback-ctls-subtitles" && event.subItem!=null) {
          thisobj.player.setLanguage(event.subItem.langIndex);
          w2ui["layout_top_toolbar"].set("playback-ctls-subtitles", {caption:event.subItem.value});
        }
      }
    };
  }

  this._layoutResizeHandler = function() {
    thisobj.player._onresize();
  }

  this._storyLoaded = function() {
    var story = this.player.story;

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
    //console.log(eventUI, story.timeline[eventUI.id]);
    story._sortTimeline();
  }
  this.timelineEditor.eventsManager.addListener("eventchange", this._onEventChange);

  this._onEventDoubleClick = function(eventUI) {
    var timelineEvent = thisobj._getTimelineEventById(eventUI.id);
    thisobj.eventEditor.editTimelineEvent(timelineEvent);
    w2ui["layout"].content("right", thisobj.eventEditor._container);
    //w2popup.open({title:"Edit Event", content:thisobj.eventEditor._container});
  }
  this.timelineEditor.eventsManager.addListener("eventdoubleclick", this._onEventDoubleClick);

  this._onSubtitleChange = function() {
    thisobj.player.story._findLanguages();
    thisobj._refreshLanguagesMenu();
  }
  this.eventEditor.eventsManager.addListener("subtitlechanged", this._onSubtitleChange);

}

},{"./../common/mod-log.js":3,"./../player/modules/player-main.js":26,"./eventeditor/eventeditor.js":7,"./storymanager/storymanager.js":10,"./timeline/timeline.js":11}],7:[function(require,module,exports){
module.exports = function(container) {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._SubtitleEditor = require("./mod-subtitleeditor.js");
  this._AudioEventEditor = require("./mod-audioeventeditor.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this.currentView = null;
  this.subtitleEditor = new this._SubtitleEditor(this);
  this.audioEventEditor = new this._AudioEventEditor(this);
  this.eventsManager=new this._EventsManager();

  //--Elements--//

  //container
  this._container = (container==null || typeof container=="undefined")?document.createElement("div"):container;
  this._container.className = "event-editor";
  this._container.style.cssText = "position:absolute; width:100%; height:100%;";
  //container > header
  this._containerHeader = document.createElement("div");
  this._containerHeader.className = "event-editor-header";
  this._containerHeader.style.cssText = "position:absolute; top:0; padding:0 0.5em; width:100%; height:2.5em; line-height:2.5em; font-weight:bold";
  this._container.appendChild(this._containerHeader);
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "height:100%; padding:2.5em 0; overflow-y:auto;"
  this._container.appendChild(this._containerBody);
  //container > footer
  this._containerFooter = document.createElement("div");
  this._containerFooter.className = "event-editor-footer";
  this._containerFooter.style.cssText = "position:absolute; width:100%; padding:0 0.5em; height:2.5em; line-height:2.5em; bottom:0; text-align: right";
  this._container.appendChild(this._containerFooter);
  //container > footer > save
  this._saveButton = document.createElement("button");
  this._saveButton.style.cssText = "margin-right:0.5em";
  this._saveButton.innerHTML = "Save";
  this._saveButton.onclick = function() {thisobj._save();}
  this._containerFooter.appendChild(this._saveButton);
  //container > footer > cancel
  this._cancelButton = document.createElement("button");
  this._cancelButton.innerHTML = "Cancel";
  this._cancelButton.onclick = function() {thisobj._cancel();}
  this._containerFooter.appendChild(this._cancelButton);

  //--Functions--//

  this.editTimelineEvent = function(timelineEvent) {
    if(typeof timelineEvent.subtitle=="object") {
      //subtitle
      this.subtitleEditor.edit(timelineEvent);
      this._containerHeader.innerHTML="Subtitle";
      this._containerBody.innerHTML="";
      this.currentView = this.subtitleEditor;
      this._containerBody.appendChild(this.currentView._container);
    } if(typeof timelineEvent.audiotrack=="string") {
      //audiotrack
      this.currentView = this.audioEventEditor;
      this._containerHeader.innerHTML="Audio";
      this._containerBody.innerHTML="";
      this._containerBody.appendChild(this.currentView._container);
    }
  }

  this._save = function() {
    if(this.currentView!=null) {
      this.currentView.save();
    }
  }

  this._cancel = function() {

  }


}

},{"./../../common/mod-eventsmanager.js":2,"./mod-audioeventeditor.js":8,"./mod-subtitleeditor.js":9}],8:[function(require,module,exports){
module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";

}

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
module.exports = function() {
  var thisobj = this;

  //prototypes
  this.log = require("./../../common/mod-log.js");

  //--variables--//

}

},{"./../../common/mod-log.js":3}],11:[function(require,module,exports){
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
    this._eventsContainer.innerHTML = "";

    var groups = this._getGroups();

    //add groups
    for(var i=0;i<groups.length;i++) {
      var groupElem = document.createElement("div");
      groupElem.className = "group";
      groupElem.style.cssText = "position:relative;min-height:1.2em";

      //add group label
      var groupLabel = document.createElement("div");
      groupLabel.className = "group-label";
      groupLabel.style.cssText = "position:absolute;top:0;left:"+(-this._groupLabelsWidth)+"px;width:"+this._groupLabelsWidth+"px;z-index:5";
      groupLabel.innerHTML = "&nbsp;&nbsp;"+groups[i];
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

},{"./../../common/mod-eventsmanager.js":2,"./tm-eventui.js":13,"./tm-timeindicator.js":14}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./tm-draghelper.js":12}],14:[function(require,module,exports){
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

},{"./tm-draghelper.js":12}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
module.exports={
  PI360:2*Math.PI,
  PI180:Math.PI,
  PI90:Math.PI/2
};

},{}],17:[function(require,module,exports){
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
	}

	setInterval(this.refresh,1000);
}

},{"./dp-languageselector.js":20,"./dp-volumecontrol.js":25}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
        console.log("Resized", current.element);
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

},{}],24:[function(require,module,exports){
//////////// SubtitleBox ////////////
module.exports = function() {
	this.container=document.createElement("div");
	this.container.style.cssText="position:absolute;bottom:0px;width:100%;text-align:center;";
	this.subtitleElement=document.createElement("span");
	this.subtitleElement.style.cssText="visibility:hidden;display:inline-block;margin:30px 30px 2% 30px;padding:5px 10px;max-width:900px;font-size:2em;font-family:sans-serif;"
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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
  this.ResizeDetector=require("./dp-resizedetector.js");

  //--prepare options--//
  this._defaultOptions = {
    showControls: true
  }

  //--variables--//
  this._logName = "Player";
  this.PLAYER_VERSION = "0.32.3";
  this.log.message("Version "+this.PLAYER_VERSION, this);
  this.eventsManager=new this.EventsManager();
  this.story=null;
  this.loadtotal=0;
  this.loadcounter=0;
  this.loaded=false;
  this.loadtimer;
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
    return new Date().getTime()*1;
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
  //Loads a new story to the player
  this.loadStory=function(url) {
    this.eventsManager.callHandlers("loading");
    this.story=new this.Story();
    this.story.onprogress=this.refreshProgress;
    this.story.onload=function() {
      thisobj._onresize();
      thisobj.setVolume(thisobj.volume);
      thisobj.eventsManager.callHandlers("ready");
    }
    this.story.load(url);

    this.time=0;
    this.mtime=0;
    this.loaded=false;

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
    if(assetsLoaded==totalAssets) {
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
          if(this.story.timeline[this.tli].action=="show") {
            //add the actor to the drawing queue according to the z factor
            var actor=this.story.actors[this.story.timeline[this.tli].index];
            this.drawQueue.add(actor);
          } else if(this.story.timeline[this.tli].action=="hide") {
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
            if(track.action.type==ramp) { //TODO delete this
              this.log.message("Ramp event",this);
            }
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

},{"./../../common/mod-eventsmanager.js":2,"./../../common/mod-log.js":3,"./../../common/mod-optionsmanager.js":4,"./../../common/mod-story.js":5,"./dp-actions.js":15,"./dp-constants.js":16,"./dp-controls.js":17,"./dp-drawqueue.js":18,"./dp-infobox.js":19,"./dp-messagesbox.js":21,"./dp-motions.js":22,"./dp-resizedetector.js":23,"./dp-subtitlebox.js":24}]},{},[6]);
