//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/mod-log.js");
  this.StoryManager = require("./storymanager/storymanager.js");
  this.StorageHelper = require("./storagehelper/storagehelper.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.EventEditor = require("./eventeditor/eventeditor.js");
  this.Popup = require("./popup/popup.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.10";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player(null, {showControls:false, height:"100%"});
  this.timelineEditor = new this.TimelineEditor();
  this.eventEditor = new this.EventEditor();
  this.popup = new this.Popup();
  this.storageHelper = new this.StorageHelper();

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
        { type: 'button', id: 'new-story', text: 'New', img: 'icon-page' },
    		{ type: 'menu',   id: 'save-story', caption: 'Save', img: 'icon-page', items: [
    			{ text: 'to browser storage', id: 'local-storage'},
    			{ text: 'to file', id: 'export'}
    		]},
        { type: 'menu',   id: 'load-story', caption: 'Load', img: 'icon-page', items: [
    			{ text: 'from browser storage', id: 'local-storage'},
    			{ text: 'from URL', id: 'url'}
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
        //Save
        else if(event.item.id=="save-story" && event.subItem!=null) {
          if(event.subItem.id=="local-storage") {
            //local storage
            thisobj.storageHelper.save(thisobj.player.story);
          } else if(event.subItem.id=="export") {
            //export
            thisobj.storageHelper.export(thisobj.player.story);
          }
        }
        //Load
        else if(event.item.id=="load-story" && event.subItem!=null) {
          if(event.subItem.id=="local-storage") {
            //local storage
            var story = thisobj.storageHelper.load();
            thisobj.player.loadStory(story);
          } else if(event.subItem.id=="url") {
            //url
            var storyURL = prompt("Enter a story URL");
            if(storyURL!=null) {thisobj.player.loadStory(storyURL);}
          }
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
    thisobj.popup.show("Edit Event", thisobj.eventEditor._container, null, thisobj._onEventSave, thisobj._onEventCancel);
  }
  this.timelineEditor.eventsManager.addListener("eventdoubleclick", this._onEventDoubleClick, this._onEventCancel);

  this._onEventSave = function() {
    thisobj.eventEditor.save();
    var currentEventId = thisobj.eventEditor.currentView.currentEvent._id;
    var currentEvent = thisobj._getTimelineEventById(currentEventId);
    var newLabel = thisobj._getTimelineEventLabel(currentEvent);
    thisobj.timelineEditor.renameItem(currentEventId, newLabel);
  }

  this._onEventCancel = function() {
    thisobj.eventEditor.cancel();
  }

  this._onSubtitleChange = function() {
    thisobj.player.story._findLanguages();
    thisobj._refreshLanguagesMenu();
  }
  this.eventEditor.eventsManager.addListener("subtitlechanged", this._onSubtitleChange);

}
