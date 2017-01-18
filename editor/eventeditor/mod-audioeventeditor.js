module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";
  this._container.style.cssText = "padding:0.5em";
  this._container.innerHTML = "Action ";
  //container > action selector
  this._actionSelect = document.createElement("select");
  this._actionSelect.innerHTML = "<option value='play'>Play</option><option value='stop'>Stop</option>";
  this._container.appendChild(this._actionSelect);

  this.edit = function(timelineEvent) {
    console.log(timelineEvent);
    if(timelineEvent!=null && typeof timelineEvent.action=="string") {
      this.currentEvent = timelineEvent;
      this._actionSelect.value = timelineEvent.action;
    }
  }

  this.save = function() {
    this.currentEvent.action = this._actionSelect.value;
  }

}
