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
  this._container.style.cssText = "position:absolute; width:100%; height:100%;";
  //container > header
  this._containerHeader = document.createElement("div");
  this._containerHeader.className = "event-editor-header";
  this._containerHeader.style.cssText = "position:absolute; top:0; padding:0 0.5em; width:100%; height:2.5em; line-height:2.5em; font-weight:bold";
  this._container.appendChild(this._containerHeader);
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "height:100%; padding:2.5em 0; overflow-y:auto;"
  this._container.appendChild(this._containerBody);
  //container > footer
  this._containerFooter = document.createElement("div");
  this._containerFooter.className = "event-editor-footer";
  this._containerFooter.style.cssText = "position:absolute; width:100%; padding:0 0.5em; height:2.5em; line-height:2.5em; bottom:0; text-align: right";
  this._container.appendChild(this._containerFooter);
  //container > footer > save
  this._saveButton = document.createElement("button");
  this._saveButton.style.cssText = "margin-right:0.5em";
  this._saveButton.innerHTML = "Save";
  this._saveButton.onclick = function() {thisobj._save();}
  this._containerFooter.appendChild(this._saveButton);
  //container > footer > cancel
  this._cancelButton = document.createElement("button");
  this._cancelButton.innerHTML = "Cancel";
  this._cancelButton.onclick = function() {thisobj._cancel();}
  this._containerFooter.appendChild(this._cancelButton);

  //--Functions--//

  this.editTimelineEvent = function(timelineEvent) {
    if(typeof timelineEvent.subtitle=="object") {
      //subtitle
      this.subtitleEditor.edit(timelineEvent);
      this._containerHeader.innerHTML="Subtitle";
      this._containerBody.innerHTML="";
      this.currentView = this.subtitleEditor;
      this._containerBody.appendChild(this.currentView._container);
    } if(typeof timelineEvent.audiotrack=="string") {
      //audiotrack
      this.currentView = this.audioEventEditor;
      this._containerHeader.innerHTML="Audio";
      this._containerBody.innerHTML="";
      this._containerBody.appendChild(this.currentView._container);
    }
  }

  this._save = function() {
    if(this.currentView!=null) {
      this.currentView.save();
    }
  }

  this._cancel = function() {

  }


}
