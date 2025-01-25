module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this.log = require("./../../common/mod-log.js");
  this._EventsManager = require("./../../common/mod-eventsmanager.js");
  this._AssetEditor = require("./mod-asseteditor.js");
  this._Popup = require("./../popup/popup.js");

  //--Variables--//
  this._logName = "Assets Manager";
  this._assets = [];
  this.eventsManager = new this._EventsManager();
  this._assetEditor = new this._AssetEditor();
  this._popup = new this._Popup();
  this._baseURL = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "assets-container";
  this._container.style.cssText = "position:relative;height:100%;user-select:none;";
  //container > list
  this._listElem = document.createElement("div");
  this._listElem.className = "assets-list";
  this._listElem.style.cssText = "padding-bottom:2em;height:100%;overflow-y:scroll;";
  this._container.appendChild(this._listElem);
  //container > controls
  this._controlsElem = document.createElement("div");
  this._controlsElem.className = "assets-controls";
  this._controlsElem.style.cssText = "position:absolute;bottom:0;width:100%;";
  this._container.appendChild(this._controlsElem);
  //container > controls > add actor
  this._addActorButton = document.createElement("a");
  this._addActorButton.className = "button";
  this._addActorButton.style.cssText = "line-height:1.5em;margin-right:1%;width:32%";
  this._addActorButton.innerHTML = "+ Actor";
  this._controlsElem.appendChild(this._addActorButton);
  //container > controls > add audiotrack
  this._addAudiotrackButton = document.createElement("a");
  this._addAudiotrackButton.className = "button";
  this._addAudiotrackButton.style.cssText = "line-height:1.5em;margin-right:1%;width:32%";
  this._addAudiotrackButton.innerHTML = "+ Audio";
  this._controlsElem.appendChild(this._addAudiotrackButton);
  //container > controls > remove
  this._removeAssetButton = document.createElement("a");
  this._removeAssetButton.className = "button";
  this._removeAssetButton.style.cssText = "line-height:1.5em;width:32%";
  this._removeAssetButton.innerHTML = "Remove";
  this._controlsElem.appendChild(this._removeAssetButton);

  this.setBaseURL = function(baseURL) {
    this._baseURL = baseURL;
  }

  this.clear = function() {
    this._listElem.innerHTML = "";
    this._assets = [];
  }

  this.addAsset = function(asset) {
    if(typeof asset=="undefined" || asset==null) {
      this.log.warning("Won't add 'null' to assets list!", this);
      return;
    }
    asset.onclick = this._assetSelected;
    asset.ondblclick = this._assetDoubleClicked;
    this._assets.push(asset);
    this._listElem.appendChild(asset._container);
  }

  this._assetSelected = function(asset) {
    if(!asset.isSelected()) {
      asset.setSelected(true);
      for(var i=0; i<thisobj._assets.length; i++) {
        if(thisobj._assets[i]!=asset) {
          thisobj._assets[i].setSelected(false);
        }
      }
    } else {
      asset.setSelected(false);
    }
  }

  this._getSelectedAssets = function() {
    var selected = [];
    for(var i=0; i<this._assets.length; i++) {
      if(this._assets[i].isSelected()) {
        selected.push(this._assets[i]);
      }
    }
    return selected;
  }

  this._assetDoubleClicked = function(asset) {
    asset.setSelected(true);
    thisobj._assetEditor.editAsset(asset, thisobj._baseURL);
    thisobj._popup.show("Edit &quot;"+asset.name+"&quot;", thisobj._assetEditor._container, null, [
      {name:"Cancel",handler:function(){thisobj._popup.hide();}},
      {name:"OK",handler:function() {
        var update = thisobj._assetEditor.getResult();
        thisobj.eventsManager.callHandlers("updateasset", {name:asset.name, type:asset.type, settings:update});
        asset.name = update.name;
        if(asset.type=="actor") {
          asset.settings.x = update.x;
          asset.settings.y = update.y;
          asset.settings.z = update.z;
          if(typeof update.motion!="undefined") {asset.settings.motion = update.motion;}
          else if(asset.settings.motion!="undefined") {asset.settings.motion = null;}
          if(typeof update.sprite!="undefined") {asset.settings.sprite = update.sprite;}
          else if(asset.settings.sprite!="undefined") {asset.settings.sprite = null;}
        } else if(asset.type=="audiotrack") {
          asset.settings.volume = update.volume;
        }
        asset.refresh();
        thisobj._popup.hide();
      }}
    ]);
  }

  this._addAssetButtonClick = function(type) {
    thisobj._assetEditor.editAsset(type);
    thisobj._popup.show("New Asset", thisobj._assetEditor._container, null, [
      {name:"Cancel",handler:function(){thisobj._popup.hide();}},
      {name:"OK",handler:function() {
        var newAsset = thisobj._assetEditor.getResult();
        thisobj.eventsManager.callHandlers("add"+type, newAsset);
        thisobj._popup.hide();
      }}
    ]);
  }
  this._addActorButton.onclick = function() {thisobj._addAssetButtonClick("actor");}
  this._addAudiotrackButton.onclick = function() {thisobj._addAssetButtonClick("audiotrack");}

  this._removeButtonClick = function() {
    var selected = this._getSelectedAssets();
    if(selected.length==0) {return;}
    if(!confirm("Are you sure?")) {return;}
    for(var i=0; i<selected.length; i++) {
      var selectedAsset = selected[i];
      //remove from dom tree
      selectedAsset._container.remove();
      //remove from assets list
      this._assets.splice(this._assets.indexOf(selectedAsset),1);
      //notify listeners
      this.eventsManager.callHandlers("removeasset", {type:selectedAsset.type, name:selectedAsset.name});
    }
  }
  this._removeAssetButton.onclick = function() {thisobj._removeButtonClick();}

  /////////////////////////////////

  this.Asset = function(type, name, url, settings) {

    var thisobj = this;

    this.type = (typeof type!="undefined" && type=="actor")?type:"audiotrack";
    this.name = name;
    this.url = url;
    this.settings = settings;
    this._selected = false;
    this.actorIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGDSURBVDiN1dK/axRBGIfxZzzisSDYxG6xkGhnaSOKP7DaciHY2dkIgoVN9J8QBKu71k5WLWJjEY6IhWBjKWyKLIIoaDDGS+R8bC4y7mV31av8Njvv7MtnZl8W/uuoibqivla31Y/q9XnARfWNs/mmHvlXdPUAcD+Xo7776oZ6oQs82wKqXot6H0/3PqhHY+dQzb0KUA4GjLKMcjisn3ssWn+ePheB5Tb0DEBVFEzGY6qiqKOnovX3aJ21oUsAaZ7TSxLSPK+jy+pJ9QRwJdo/HTeFuFB3gcN16Q/yNYTw68+o31SA1XLAnVHGs3Jmpk3px0Ud3QJ4URXsTcasVzMzbcpOG/oW4Fya0+8lnE9nZtqUd41v1Hsd/2lTfvuk+k0fxcXgSUl2a8Twadl10+dt6Drwar8o1irGexOKtaoN3AIeNqIhBIGbwC5Afikl6ffIL6Zt6O0Qwqe2BgDUXP3SMcdt9UYnVoOX1AfqpvpjCr1XX6p31eN/BR5wwIK6MBcyb34C7WdjQZPGMB0AAAAASUVORK5CYII=";
    this.audiotrackIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGbSURBVDiN3ZQ/T1NxFIaf91pDE8oCbvI5aA1L72XAmDDScAlDGRhYiAqsDKxGAy6EsHTrVVkIIdCh3A4ktF/AT6AbMCiQ8vc4eGuapvWWhkXf6fz7PTnn5OQH/53MbKXbWnUJXALeSfpTXw68SWEFwd55fyo/MbF72TXUzN4C7wGaoQBhkM0YKgFf67fJ8Vcz+z8AnBjg6wawndypShVjHsgkE/WN2E7NbAFYb461dtrQYeBWgTRGxvPDWqIJYi2P19sBwmI2b9ImsH3iPJvN5b5cm1SQWVpYHqj9dfx2cv1KQb8vYXrITlcBnLv7CoBJWYjZaSddPenbApDZHAAJvkWp4Z6hL3Ols8gcBHBzlfPIT/UMPfg8PhiZZwBHO6MDkf+zZ2jf3dUcgElbADcXT59Hqe89QQ+L7rRJq4YKpxpaAbh3HDdKh/AId2qGwk/uMTCC8cLzw84nJekj8Cau8zBwfSANFD0/rEHM+JLWgMXOwGwGsQFU67fJ+UY8dqeSPgDLrfFy4E0aKgtKF/2pscZn8iA95D/9d/QL6MuRt4ZLgUIAAAAASUVORK5CYII=";

    //container
    this._container = document.createElement("div");
    this._container.className = "asset "+this.type;
    // this._container.innerHTML = name;
    //container > icon
    this._assetIconElem = document.createElement("div");
    this._assetIconElem.style.cssText = "display:inline-block; width:21px;height:21px; vertical-align:middle; opacity:0.5;";
    this._assetIconElem.style.backgroundImage = "url("+(type=="actor"?this.actorIcon:this.audiotrackIcon)+")";
    this._container.appendChild(this._assetIconElem);
    //container > label
    this._labelElem = document.createElement("div");
    this._labelElem.style.cssText = "display:inline-block; line-height:21px; vertical-align:middle; margin-left:0.5em";
    this._labelElem.innerHTML = name;
    this._container.appendChild(this._labelElem);

    this.refresh = function() {
      this._labelElem.innerHTML = this.name;
    }

    this.setSelected = function(selected) {
      this._selected = selected;
      if(selected==true) {
        thisobj._container.className = "asset selected "+thisobj.type;
      } else {
        this._container.className = "asset "+this.type;
      }
    }

    this.isSelected = function() {
      return this._selected;
    }

    this._container.onclick = function(event) {
      thisobj.onclick(thisobj);
    }

    this._container.ondblclick = function(event) {
      thisobj.ondblclick(thisobj);
    }

    this.onclick = function() {};

    this.ondblclick = function() {};

  }

}
