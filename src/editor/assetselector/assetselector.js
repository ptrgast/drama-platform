module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  // this._EventsManager = require("./../../common/mod-eventsmanager.js");

  //--Variables--//

  this._assets = [];

  // this.eventsManager=new this._EventsManager();

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "event-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "event-editor-body";
  this._containerBody.style.cssText = "padding:0; max-height:500px; overflow-y:auto;"
  this._container.appendChild(this._containerBody);

  //--Functions--//

  this.setAssets = function(assets) {
    this._assets = assets;

    this._containerBody.innerHTML = "";

    for(var i=0; i<this._assets.length; i++) {
      var option = document.createElement("a");
      option.assetName = this._assets[i];
      option.style.cssText = "display:block; padding:2px 1em; color:#000";
      option.innerHTML = this._assets[i];
      option.setAttribute("href","javascript:");
      option.onclick = this._onselect;
      this._containerBody.appendChild(option);
    }
  }

  this._onselect = function() {
    if(thisobj.onselect!=null) {
      thisobj.onselect(this.assetName);
    }
  }

  this.onselect = function(assetName) {}

}
