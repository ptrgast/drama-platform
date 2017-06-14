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
