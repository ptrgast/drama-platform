module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";

}
