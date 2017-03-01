module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//
  this.log = require("./../../common/mod-log.js");

  //--Variables--//

  this._logName = "Storage Helper";
  this._localStoryKey = "story";
  // this._visible = false;
  // this._okHandler = null;
  // this._cancelHandler = null;
  // this.resizeDetector = new this._ResizeDetector();
  // this._defaultKeyDownHandler = null;

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
    console.log(encodedStory);

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
      timeline: story.timeline
    };

    for(var i=0; i<story.actors.length; i++) {
      if(story.actors[i]._origin!=null) {
        nakedStory.actors.push(story.actors[i]._origin);
      }
    }

    for(var i=0; i<story.audiotracks.length; i++) {
      if(story.audiotracks[i]._origin!=null) {
        nakedStory.audiotracks.push(story.audiotracks[i]._origin);
      }
    }

    var serializedStory = JSON.stringify(nakedStory);
    return serializedStory;
  }

}
