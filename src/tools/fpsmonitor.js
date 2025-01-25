(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.FpsMonitor = require("./mod-fpsmonitor.js");

},{"./mod-fpsmonitor.js":3}],3:[function(require,module,exports){
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

},{"./../../common/mod-log.js":1}]},{},[2]);
