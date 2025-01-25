//Create a package like hierarchy
if(typeof drama=="undefined") {window.drama={};}

drama.Editor = function(containerId) {
  var thisobj = this;

  //--prototypes & includes--//
  this.log = require("./../common/mod-log.js");
  this.AssetsManager = require("./assetsmanager/assetsmanager.js");
  this.AssetSelector = require("./assetselector/assetselector.js");
  this.StorageHelper = require("./storagehelper/storagehelper.js");
  this.TimelineEditor = require("./timeline/timeline.js");
  this.EventEditor = require("./eventeditor/eventeditor.js");
  this.StoryGlobalSettingsEditor = require("./storyglobalsettings/storyglobalsettings.js");
  this.LoadHistory = require("./loadhistory/loadhistory.js");
  this.Popup = require("./popup/popup.js");
  this.Player = require("./../player/modules/player-main.js");

  //--variables--//
  this._logName = "Editor";
  this.EDITOR_VERSION = "0.13.2";
  this.log.message("Version "+this.EDITOR_VERSION, this);
  this.player = new this.Player(null, {showControls:false, height:"100%"});
  this.timelineEditor = new this.TimelineEditor();
  this.eventEditor = new this.EventEditor();
  this.assetsManager = new this.AssetsManager();
  this.assetSelector = new this.AssetSelector();
  this.popup = new this.Popup();
  this.storageHelper = new this.StorageHelper();
  this.storyGlobalSettingsEditor = new this.StoryGlobalSettingsEditor();
  this.loadHistory = new this.LoadHistory();

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
    var rightStyle = layoutStyle + "background-color:#222;";
    var bottomStyle = layoutStyle + "background-color:#222;";
    $("#"+containerId).w2layout({
      name: 'layout',
      padding: 4,
      panels: [
        { type: 'top', size: 30, resizable: false, style: layoutStyle, toolbar: thisobj.toolbar },
        { type: 'main', style: mainStyle, content: thisobj.player.playerElement},
        { type: 'right', size: 300, resizable: true, style: rightStyle, content: thisobj.assetsManager._container },
        { type: 'bottom', size: 300, resizable: true, style: bottomStyle, content: thisobj.timelineEditor._container }
      ],
      onResize: thisobj._layoutResizeHandler
    });

    document.addEventListener("keydown", thisobj._onKeydownGlobal);
  }

  //init the top toolbar
  this._initToolbar = function() {
    this.toolbar = {
      name: "topbar",
    	items: [
        { type: 'menu', id: 'file-menu', text: 'File', img: 'icon-page', items: [
          { text: 'New story', id: 'new-story'},
          { text: '--' },
          { text: 'Load from browser', id: 'load-local-storage'},
          { text: 'Load from URL&hellip;', id: 'load-url'},
          { text: 'Load history&hellip;', id: 'show-load-history'},
          { text: '--' },
          { text: 'Save to browser', id: 'save-local-storage'},
          { text: 'Save to file', id: 'save-export'}
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
    		{ type: 'button',  id: 'story-title',  caption: 'Untitled'}
    	],
      onClick: function(event) {
        if(event.item.id=="playback-ctls-subtitles" && event.subItem!=null) {
          thisobj.player.setLanguage(event.subItem.langIndex);
          w2ui["layout_top_toolbar"].set("playback-ctls-subtitles", {caption:event.subItem.value});
        }
        //Save
        else if(event.item.id=="file-menu" && event.subItem!=null) {
          if(event.subItem.id=="new-story") {
            var newStory = {
              format: "p417",
              title: "Untitled",
              width: 800,
              height: 600,
              actors: [],
              audiotracks: [],
              timeline: []
            };
            thisobj.player.loadStory(newStory);
          }
          // Load
          else if(event.subItem.id=="load-local-storage") {
            //local storage
            var story = thisobj.storageHelper.load();
            thisobj.player.loadStory(story);
          } else if(event.subItem.id=="load-url") {
            //url
            var storyURL = prompt("Enter a story URL");
            if(storyURL!=null) {thisobj.player.loadStory(storyURL);}
            thisobj.loadHistory.save(storyURL);
          } else if(event.subItem.id=="show-load-history") {
              thisobj.loadHistory.show(function(url) {
                  thisobj.player.loadStory(url);
              });
          }
          // Save
          else if(event.subItem.id=="save-local-storage") {
            //local storage
            thisobj.storageHelper.save(thisobj.player.story);
          } else if(event.subItem.id=="save-export") {
            //export
            thisobj.storageHelper.export(thisobj.player.story);
          }
        }
        //Story Global Settings
        else if(event.item.id=="story-title") {
          var settings = {
            title: "Untitled",
            width: 800,
            height: 600
          };
          if(thisobj.player.story.isLoaded()) {
            settings.title = thisobj.player.story.title;
            settings.width = thisobj.player.story.width;
            settings.height = thisobj.player.story.height;
          }
          thisobj.storyGlobalSettingsEditor.setCurrentSettings(settings);
          thisobj.popup.show("Story Settings", thisobj.storyGlobalSettingsEditor._container, null, [
            {name:"Cancel", handler:function() {thisobj.popup.hide();}},
            {name:"OK", handler:function() {
              if(thisobj.storyGlobalSettingsEditor.settingsChanged()) {
                var newSettings = thisobj.storyGlobalSettingsEditor.getResult();
                thisobj.player.story.title = newSettings.title;
                thisobj.player.story.width = newSettings.width;
                thisobj.player.story.height = newSettings.height;
                thisobj.player._onresize();
                thisobj.player.stop();
                w2ui["layout_top_toolbar"].set("story-title", {caption:newSettings.title});
              }
              thisobj.popup.hide();
            }}
          ]);
        }
      }
    };
  }

  this._layoutResizeHandler = function() {
    thisobj.player._onresize();
  }

  this._storyLoaded = function() {
    var story = this.player.story;

    w2ui["layout_top_toolbar"].set("story-title", {caption:story.title});

    this._inflateAssetsManager(story);
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

  this._inflateAssetsManager = function(story) {
    this.assetsManager.setBaseURL(story._storyURL);
    this.assetsManager.clear();
    for(var i=0; i<story.actors.length; i++) {
      var actor = story.actors[i];
      var actorSettings = {x:actor.x, y:actor.y, z:actor.z};
      if(typeof actor.motion=="object") {actorSettings.motion = actor.motion;}
      if(typeof actor.sprite=="object") {actorSettings.sprite = actor.sprite;}
      var asset = new this.assetsManager.Asset("actor", actor.name, actor.url, actorSettings);
      this.assetsManager.addAsset(asset);
    }
    for(var i=0; i<story.audiotracks.length; i++) {
      var audiotrack = story.audiotracks[i];
      var asset = new this.assetsManager.Asset("audiotrack", audiotrack._name, audiotrack._origin.url, {volume:audiotrack._volume});
      this.assetsManager.addAsset(asset);
    }
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
    // console.log(eventUI, timelineEvent);
    story._sortTimeline();
  }
  this.timelineEditor.eventsManager.addListener("eventchange", this._onEventChange);

  this._onAddEvent = function(tmp) {
    //get the max ID
    var maxId = thisobj.player.story.getMaxId();

    //actor or audiotrack?
    var eventType = "other";
    for(var i=0; i<thisobj.player.story.actors.length; i++) {
      if(thisobj.player.story.actors[i].name==tmp.group) {
        eventType = "actor";
        break;
      }
    }
    for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
      if(thisobj.player.story.audiotracks[i]._name==tmp.group) {
        eventType = "audiotrack";
        break;
      }
    }

    var timelineEvent = {
      _id: maxId+1,
      time: tmp.time,
    };
    if(tmp.group=="subtitles") {
      timelineEvent.subtitle = {en:"text here"};
    } else if(eventType=="actor") {
      timelineEvent.actor = tmp.group;
      timelineEvent.action = {type:"show"};
    } else if(eventType=="audiotrack") {
      timelineEvent.audiotrack = tmp.group;
      timelineEvent.action = "play";
    }
    thisobj.player.story.timeline.push(timelineEvent);
    thisobj.player.story._sortTimeline();
    thisobj.player.story._mapNamesToIndeces();
    thisobj.timelineEditor.addItem(timelineEvent._id, tmp.group, thisobj._getTimelineEventLabel(timelineEvent), tmp.time, null);
    thisobj.timelineEditor._inflateGroups();
  }
  this.timelineEditor.eventsManager.addListener("addevent", this._onAddEvent);

  this._onEventDoubleClick = function(eventUI) {
    var timelineEvent = thisobj._getTimelineEventById(eventUI.id);
    thisobj.eventEditor.editTimelineEvent(timelineEvent);
    // thisobj.popup.show("Edit Event", thisobj.eventEditor._container, null, thisobj._onEventSave, thisobj._onEventCancel);
    thisobj.popup.show(
      "Edit Event",
      thisobj.eventEditor._container,
      null,
      [{name:"DELETE", handler:thisobj._onEventDelete}, {name:"Cancel", handler:thisobj._onEventCancel}, {name:"OK", handler:thisobj._onEventSave}]
    );
  }
  this.timelineEditor.eventsManager.addListener("eventdoubleclick", this._onEventDoubleClick, this._onEventCancel);

  this._onEventSave = function() {
    thisobj.eventEditor.save();
    var currentEventId = thisobj.eventEditor.currentView.currentEvent._id;
    var currentEvent = thisobj._getTimelineEventById(currentEventId);
    if(typeof currentEvent.action!="undefined" && typeof currentEvent.action.params.tt!="undefined") {
      thisobj.timelineEditor.setItemEndTime(currentEventId, currentEvent.action.params.tt);
    }
    var newLabel = thisobj._getTimelineEventLabel(currentEvent);
    thisobj.timelineEditor.renameItem(currentEventId, newLabel);
    thisobj.popup.hide();
  }

  this._onEventCancel = function() {
    thisobj.eventEditor.cancel();
    thisobj.popup.hide();
  }

  this._onEventDelete = function() {
    // if(confirm("Are you sure?")) {
    var currentEventId = thisobj.eventEditor.currentView.currentEvent._id;
    thisobj.timelineEditor.deleteItem(currentEventId);
    thisobj.player.story.removeTimelineEvent(currentEventId);
    // }
    thisobj.popup.hide();
  }

  this._onAddTimelineGroup = function() {
      var selectables = [];
      var currentGroups = thisobj.timelineEditor._getGroups();

      if(currentGroups.indexOf("subtitles")<0) {selectables.push("subtitles");}
      if(currentGroups.indexOf("trigger")<0) {selectables.push("trigger");}
      for(var i=0; i<thisobj.player.story.actors.length; i++) {
        if(currentGroups.indexOf(thisobj.player.story.actors[i].name)<0 && selectables.indexOf(thisobj.player.story.actors[i].name)<0) {
          selectables.push(thisobj.player.story.actors[i].name);
        }
      }
      for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
        if(currentGroups.indexOf(thisobj.player.story.audiotracks[i]._name)<0) {
          selectables.push(thisobj.player.story.audiotracks[i]._name);
        }
      }

      thisobj.assetSelector.setAssets(selectables);
      thisobj.popup.show(
        "Select",
        thisobj.assetSelector._container,
        null,
        [{name:"Cancel", handler:function() {thisobj.popup.hide();}}]
      );
  }
  this.timelineEditor.eventsManager.addListener("addtimelinegroup", this._onAddTimelineGroup);

  this._onAddTimelineGroupSelect = function(assetName) {
    thisobj.popup.hide();

    var maxId = thisobj.player.story.getMaxId();
    var timelineEvent = {
      _id: maxId+1,
      time: 0,
    };

    if(assetName=="subtitles") {
      timelineEvent.subtitle = {en:"text here"};
    } else if(assetName=="trigger") {
      timelineEvent.actor = assetName;
      timelineEvent.action = null;
    } else {
      //actor or audiotrack?
      var eventType = "other";
      for(var i=0; i<thisobj.player.story.actors.length; i++) {
        if(thisobj.player.story.actors[i].name==assetName) {
          eventType = "actor";
          break;
        }
      }
      for(var i=0; i<thisobj.player.story.audiotracks.length; i++) {
        if(thisobj.player.story.audiotracks[i]._name==assetName) {
          eventType = "audiotrack";
          break;
        }
      }
      if(eventType=="actor") {
        timelineEvent.actor = assetName;
        timelineEvent.action = {type:"show"};
      } else if(eventType=="audiotrack") {
        timelineEvent.audiotrack = assetName;
        timelineEvent.action = "play";
      }
    }
    thisobj.player.story.timeline.push(timelineEvent);
    thisobj.player.story._sortTimeline();
    thisobj.player.story._mapNamesToIndeces();
    thisobj.timelineEditor.addItem(timelineEvent._id, assetName, thisobj._getTimelineEventLabel(timelineEvent), timelineEvent.time, null);
    thisobj.timelineEditor._inflateGroups();
    if(assetName=="subtitles") {thisobj._onSubtitleChange();}
    console.log(assetName);
  }
  this.assetSelector.onselect = this._onAddTimelineGroupSelect;

  this._onSubtitleChange = function() {
    thisobj.player.story._findLanguages();
    thisobj._refreshLanguagesMenu();
  }
  this.eventEditor.eventsManager.addListener("subtitlechanged", this._onSubtitleChange);

  this._onAddActor = function(newActor) {
    thisobj.player.story.addActor(newActor);
    thisobj._inflateAssetsManager(thisobj.player.story);
  }
  this.assetsManager.eventsManager.addListener("addactor", this._onAddActor);

  this._onAddAudiotrack = function(newAudiotrack) {
    newAudiotrack.url = [newAudiotrack.url];
    thisobj.player.story.addAudiotrack(newAudiotrack);
    thisobj._inflateAssetsManager(thisobj.player.story);
  }
  this.assetsManager.eventsManager.addListener("addaudiotrack", this._onAddAudiotrack);

  this._onAssetRemove = function(assetDetails) {
    //Remove from timeline editor
    thisobj.timelineEditor.deleteGroup(assetDetails.name);
    //Remove from story
    if(assetDetails.type=="actor") {
      thisobj.player.story.removeActor(assetDetails.name);
    } else if(assetDetails.type=="audiotrack") {
      thisobj.player.story.removeAudiotrack(assetDetails.name);
    }
    thisobj.player.stop();
  }
  this.assetsManager.eventsManager.addListener("removeasset", this._onAssetRemove);

  this._onAssetUpdate = function(updatedAsset) {
    console.log(updatedAsset);
    var assetIndex = -1;
    var asset = null;
    if(updatedAsset.type=="actor") {
      var actors = thisobj.player.story.actors;
      for(var i=0; i<actors.length; i++) {
        if(actors[i].name==updatedAsset.name) {
          assetIndex = i;
          asset = actors[i];
          break;
        }
      }
      if(asset==null) {thisobj.log.error("Asset not found!", thisobj); return;}
      asset.x = asset.startX = asset._origin.x = updatedAsset.settings.x;
      asset.y = asset.startY = asset._origin.y = updatedAsset.settings.y;
      asset.z = asset.startZ = asset._origin.z = updatedAsset.settings.z;
      if(typeof updatedAsset.settings.motion!="undefined") {asset.motion = updatedAsset.settings.motion;}
      else if(typeof asset.motion!="undefined") {asset.resetMotion();}
      if(typeof updatedAsset.settings.sprite!="undefined") {asset.sprite = updatedAsset.settings.sprite;}
      else if(typeof asset.sprite!="undefined") {asset.sprite = null;}
      if(asset.url!=updatedAsset.settings.url) {
        asset._origin.url = updatedAsset.settings.url;
        asset.changeImage(updatedAsset.settings.url);
      }
      if(updatedAsset.name!=updatedAsset.settings.name) {
        asset.name = asset._origin.name = updatedAsset.settings.name;
        var timeline = thisobj.player.story.timeline;
        for(var i=0;i<timeline.length;i++) {
          if(timeline[i].actor==updatedAsset.name) {
            timeline[i].actor = updatedAsset.settings.name;
          }
        }
        thisobj.timelineEditor.renameGroup(updatedAsset.name, updatedAsset.settings.name);
      }
      asset._origin.url = asset.url;
      if(typeof asset.motion!="undefined" && asset.motion!=null) {asset._origin.motion = asset.motion;}
      if(typeof asset.sprite!="undefined" && asset.sprite!=null) {asset._origin.sprite = asset.sprite;}
    } else if(updatedAsset.type=="audiotrack") {
      var audiotracks = thisobj.player.story.audiotracks;
      for(var i=0; i<audiotracks.length; i++) {
        if(audiotracks[i]._name==updatedAsset.name) {
          assetIndex = i;
          asset = audiotracks[i];
          break;
        }
      }
      if(asset==null) {thisobj.log.error("Asset not found!", thisobj); return;}
      asset._volume = updatedAsset.settings.volume;
      if(updatedAsset.name!=updatedAsset.settings.name) {
        asset._name = asset._origin.name = updatedAsset.settings.name;
        var timeline = thisobj.player.story.timeline;
        for(var i=0;i<timeline.length;i++) {
          if(timeline[i].audiotrack==updatedAsset.name) {
            timeline[i].audiotrack = updatedAsset.settings.name;
          }
        }
        thisobj.timelineEditor.renameGroup(updatedAsset.name, updatedAsset.settings.name);
      }
    }
  }
  this.assetsManager.eventsManager.addListener("updateasset", this._onAssetUpdate);

  this._onKeydownGlobal = function(event) {
    if(window._dramaBlockGlobalKeys) {return;}
    if(event.keyCode==32) {
        if(thisobj.player.isPlaying()) {
          w2ui["layout_top_toolbar"].uncheck("playback-ctls-play");
          thisobj.player.pause();
        } else {
          w2ui["layout_top_toolbar"].check("playback-ctls-play");
          thisobj.player.play();
        }
    }
  }
}
