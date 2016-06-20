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
  this._loadProgress=0;
  this._loadTimer;

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
    this._audioElement.load();
    this._audioElement.addEventListener("ended",this.onPlaybackEnd);
    this._audioElement.volume=0;
    this._audioElement.play();
    this._loadTimer=setInterval(function() {thisobj._checkLoadProgress();},500);
  }

  this._checkLoadProgress=function() {
    if(this._audioElement.buffered.length>0&&this._loadProgress<1) {
          this._loadProgress=this._audioElement.buffered.end(0)/this._audioElement.duration;
    } else if(this._audioElement.seekable.length>0&&this._loadProgress<1) {
          //for small clips Opera doesn't create any time range in the buffered property so let's check the seekable property
          this._loadProgress=this._audioElement.seekable.end(0)/this._audioElement.duration;
    }
    if(this._loadProgress>=1) {
      //track loaded
      this._audioElement.pause();
      this._audioElement.currentTime=0;
      clearInterval(this._loadTimer);
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
