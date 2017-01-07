module.exports = function(container) {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._SubtitleEditor = require("./mod-subtitleeditor.js");
  this._AudioEventEditor = require("./mod-audioeventeditor.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this.currentView = null;
  this.subtitleEditor = new this._SubtitleEditor(this);
  this.audioEventEditor = new this._AudioEventEditor(this);
  this.eventsManager=new this._EventsManager();

  //--Elements--//

  //container
  this._container = (container==null || typeof container=="undefined")?document.createElement("div"):container;
  this._container.className = "event-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "padding:0; overflow-y:auto;"
  this._container.appendChild(this._containerBody);

  //--Functions--//

  this.editTimelineEvent = function(timelineEvent) {
    if(typeof timelineEvent.subtitle=="object") {
      //subtitle
      this.subtitleEditor.edit(timelineEvent);
      this._containerBody.innerHTML="";
      this.currentView = this.subtitleEditor;
      this._containerBody.appendChild(this.currentView._container);
    } if(typeof timelineEvent.audiotrack=="string") {
      //audiotrack
      this.currentView = this.audioEventEditor;
      this._containerBody.innerHTML="";
      this._containerBody.appendChild(this.currentView._container);
    }
  }

  this.save = function() {
    console.log("Save");
    if(this.currentView!=null) {
      this.currentView.save();
    }
  }

  this.cancel = function() {
    console.log("Cancel");
  }


}
