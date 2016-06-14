//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/dp-log.js");
  this.StoryManager = require("./storymanager/storymanager.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.6";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player();
  this.timelineEditor = new this.TimelineEditor();

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

    var layoutStyle = 'border: 1px solid #dfdfdf; padding: 5px; overflow: hidden;';
    var mainStyle = layoutStyle + "background-color:#000;";
    var bottomStyle = layoutStyle + "background-color:#222;";
    $("#"+containerId).w2layout({
      name: 'layout',
      padding: 4,
      panels: [
        { type: 'top', size: 30, resizable: false, style: layoutStyle, toolbar: thisobj.toolbar },
        { type: 'main', style: mainStyle, content: thisobj.player.playerElement},
        { type: 'right', size: 300, resizable: true, style: layoutStyle, content: "right content" },
        { type: 'bottom', size: 300, resizable: true, style: bottomStyle, content: thisobj.timelineEditor.container }
      ],
      onResize: thisobj._layoutResizeHandler
    });
  }

  //init the top toolbar
  this._initToolbar = function() {
    this.toolbar = {
    	items: [
    		{ type: 'check',  id: 'item1', caption: 'Check', img: 'icon-page', checked: true },
    		{ type: 'break',  id: 'break0' },
    		{ type: 'menu',   id: 'item2', caption: 'Drop Down', img: 'icon-folder', items: [
    			{ text: 'Item 1', icon: 'icon-page' },
    			{ text: 'Item 2', icon: 'icon-page' },
    			{ text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
    		]},
    		{ type: 'break', id: 'break1' },
    		{ type: 'radio',  id: 'item3',  group: '1', caption: 'Radio 1', icon: 'fa-star', checked: true },
    		{ type: 'radio',  id: 'item4',  group: '1', caption: 'Radio 2', icon: 'fa-star-empty' },
    		{ type: 'spacer' },
    		{ type: 'button',  id: 'item5',  caption: 'Item 5', icon: 'fa-home' }
    	]
    };
  }

  this._layoutResizeHandler = function() {
    console.log(".");
    thisobj.player._onresize();
  }

  this._storyLoaded = function() {
    var story = this.player.story;

    //create tracks
    for(var i=0;i<story.actors.length;i++) {
      var current = story.actors[i];
      current._editorTrack = new this.timelineEditor.Track();
      this.timelineEditor.addTrack(current._editorTrack);
    }

    //set timeline duration (this must be done after the track creation
    //otherwise we will have to set the duration of each track separately)
    this.timelineEditor.setDuration(story.getDuration());

    //add events to tracks
    for(var i=0;i<story.timeline.length;i++) {
      var currentEvent = story.timeline[i];
      if(typeof currentEvent.actor!="undefined") {
        //we 've got an actor here
        var currentActor = story.actors[currentEvent.index];
        var trackItem = new this.timelineEditor.TrackItem(currentActor._editorTrack);
        trackItem.setName(currentActor.name+" ["+currentEvent.action+"]");
        trackItem.setTime(currentEvent.time);
        if(currentEvent.action!=null && typeof currentEvent.action=="object" && typeof currentEvent.action.params=="object" && typeof currentEvent.action.params.tt=="number") {
          var duration = currentEvent.action.params.tt-currentEvent.time;
          trackItem.setDuration(duration);
        }
        currentActor._editorTrack.addItem(trackItem);
      }
      //console.log(current.actor);
    }
  }

  this._onPlaybackTimeChange = function(time) {
    this.timelineEditor.setCurrentTime(time);
  }

  //initialize
  $(window).load(this._init);

  this.timelineEditor.onusertime = function(newTime) {
    thisobj.player.seek(newTime);
  }

}
