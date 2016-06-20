//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/mod-log.js");
  this.StoryManager = require("./storymanager/storymanager.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.6";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player(null, {showControls:false});
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

    //refresh the subtitles menu
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

  this.timelineEditor.onusertime = function(newTime) {
    thisobj.player.seek(newTime);
  }

}
