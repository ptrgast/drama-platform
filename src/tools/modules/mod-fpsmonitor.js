module.exports = function(player) {

  //--prototypes & includes--//
  this.log=require("./../../common/mod-log.js");

  //--variables--//
  var thisobj = this;
  this._logName = "FPS Monitor";
  this._player = player;
  this._history = [];
  this._fpsTimer = null;
  this._previousTotalFrames = 0;

  //--functions--//

  this._onplay = function() {
    console.log("playback started");
    this._fpsTimer = setInterval(function() {thisobj._refresh();}, 1000);
  }

  this._onpause = function() {
    clearInterval(this._fpsTimer);
    this._fpsTimer = null;
    this._previousTotalFrames = this._player.framesCounter;
  }

  this._onstop = function() {
    //Calculate metrics
    if(this._history.length>0) {
      var fpsSum = 0;
      var fpsAverage = 0;
      var fpsMin = this._history[0];
      var fpsMax = this._history[0];
      for(var i=0; i<this._history.length; i++) {
        var currentFps = this._history[i];
        fpsSum += currentFps;
        if(currentFps<fpsMin) {fpsMin = currentFps;}
        if(currentFps>fpsMax) {fpsMax = currentFps;}
      }
      fpsAverage = Math.round(fpsSum/this._history.length);

      //Export results
      this.log.message("Average FPS: "+fpsAverage, this);
      this.log.message("Maximum FPS: "+fpsMax, this);
      this.log.message("Minimum FPS: "+fpsMin, this);
    }


    //Reset
    this._history = [];
    clearInterval(this._fpsTimer);
    this._fpsTimer = null;
  }

  this._refresh = function() {
    var fps = this._player.framesCounter-this._previousTotalFrames;
    if(fps>0) {this._history.push(fps);}
    this._previousTotalFrames = this._player.framesCounter;
  }

  this._player.eventsManager.addListener("play", function(){thisobj._onplay();});
  this._player.eventsManager.addListener("pause", function(){thisobj._onpause();});
  this._player.eventsManager.addListener("stop", function(){thisobj._onstop();});

}
