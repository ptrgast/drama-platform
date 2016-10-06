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
  this.EventsManager=require("./dp-eventsmanager.js");
  this.DrawQueue=require("./dp-drawqueue.js");
  this.MessagesBox=require("./dp-messagesbox.js");
  this.InfoBox=require("./dp-infobox.js");
  this.Controls=require("./dp-controls.js");
  this.SubtitleBox=require("./dp-subtitlebox.js");
  this.Story=require("./../../common/mod-story.js");
  this.OptionsManager=require("./../../common/mod-optionsmanager.js");

  //--prepare options--//
  this._defaultOptions = {
    showControls: true
  }

  //--variables--//
  this._logName = "Player";
  this.PLAYER_VERSION = "0.32.2";
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

  //create elements
  this.playerElement=(typeof containerId=="undefined" || containerId==null)?document.createElement("div"):document.getElementById(containerId);
  this.playerElement.style.position="relative";
  this.playerElement.style.overflow="hidden";
  this.playerElement.style.backgroundColor="#000";
  this.canvasWrapper=document.createElement("div");
  this.canvasWrapper.style.cssText="font-size:0px;text-align:center;";
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
      this.playerHeight=this.playerWidth/this.playerRatio;
    } else {
      this.playerWidth=window.innerWidth;
      this.playerHeight=window.innerHeight;
    }
    this.playerElement.style.height=this.playerHeight+"px";
    this._computeCanvasSize(this.playerWidth, this.playerHeight);
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
