module.exports = function() {

  var thisobj = this;

  //--Variables--//

  this._currentAsset = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "asset-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "asset-editor-body";
  this._containerBody.style.cssText = "padding:0.5em";
  this._container.appendChild(this._containerBody);
  //container > body > preview
  this._assetPreview = document.createElement("img");
  this._assetPreview.className = "preview"
  this._assetPreview.style.cssText = "float:right;max-width:120px;max-height:120px;border:1px solid #aaa";
  this._containerBody.appendChild(this._assetPreview);
  //container > body > asset-name
  this._containerBody.innerHTML+="Name ";
  this._assetName = document.createElement("input");
  this._assetName.className = "asset-name"
  this._assetName.style.marginBottom = "0.5em";
  this._assetName.setAttribute("name","name");
  this._containerBody.appendChild(this._assetName);
  //container > body > asset-url
  this._containerBody.innerHTML+="<br>URL ";
  this._assetUrl = document.createElement("input");
  this._assetUrl.className = "asset-url"
  this._assetUrl.style.marginBottom = "0.5em";
  this._assetUrl.setAttribute("name","url");
  this._containerBody.appendChild(this._assetUrl);
  //container > body > asset-settings
  this._assetSettings = document.createElement("div");
  this._containerBody.appendChild(this._assetSettings);

  //actor
  this._actorEditor = document.createElement("div");
  this._actorEditor.className = "actor-editor";
  this._actorEditor.style.cssText = "padding:0;"
  //actor > xyz
  this._actorPosition = document.createElement("div");
  this._actorPosition.className = "actor-position";
  this._actorPosition.innerHTML = "X <input type='number' name='x' style='margin-bottom:0.2em'><br/>"+
                                    "Y <input type='number' name='y' style='margin-bottom:0.2em'><br/>"+
                                    "Z <input type='number' name='z' style='margin-bottom:0.2em'><br/>";
  this._actorEditor.appendChild(this._actorPosition);

  //actor > ---
  this._actorEditor.appendChild(document.createElement("hr"));
  //actor > actor-type
  this._actorEditor.innerHTML+="Type ";
  this._actorTypeSelector = document.createElement("select");
  this._actorTypeSelector.setAttribute("name","type");
  this._actorTypeSelector.className = "actor-type";
  this._actorTypeSelector.style.marginBottom = "1em";
  this._actorTypeSelector.innerHTML = "<option value='static'>Static</option>"+
                                    "<option value='motion'>Motion</option>"+
                                    "<option value='sprite'>Sprite</option>";
  this._actorEditor.appendChild(this._actorTypeSelector);
  this._actorTypeSelectorOnChange = function() {
    thisobj._actorTypeSettings.innerHTML = "";
    if(thisobj._actorTypeSelector.value=="motion") {
      thisobj._actorTypeSettings.appendChild(thisobj._actorMotion);
      thisobj._motionTypeSelectorOnChange();
    } else if(thisobj._actorTypeSelector.value=="sprite") {
      thisobj._actorTypeSettings.appendChild(thisobj._actorSprite);
    }
  }
  this._actorTypeSelector.onchange = this._actorTypeSelectorOnChange;
  //actor > type-settings
  this._actorTypeSettings = document.createElement("div");
  this._actorTypeSettings.className = "actor-type-settings";
  this._actorEditor.appendChild(this._actorTypeSettings);

  //motion
  this._actorMotion = document.createElement("div");
  this._actorMotion.className = "motion-editor";
  this._actorMotion.innerHTML = "Motion <select name='type' style='margin-bottom:0.5em'>"+
                                "<option value='rotate'>Rotate</option>"+
                                "<option value='vsin'>Vertical Sinusoid</option>"+
                                "<option value='ellipse'>Ellipse</option>"+
                                "<option value='swing'>Swing</option>"+
                                "</select><br>"+
                                "<div class='motion-attributes'></div>";
  this._motionTypeSelectorOnChange = function() {
    var attrContainer = thisobj._actorMotion.children[2];
    attrContainer.innerHTML = "";
    if(thisobj._actorMotion.children[0].value=="swing") {
      attrContainer.appendChild(thisobj._swingAttributes);
    } else {
      attrContainer.appendChild(thisobj._genericMotionAttributes);
    }
  }
  this._actorMotion.children[0].onchange = this._motionTypeSelectorOnChange;

  //motion > attributes
  this._genericMotionAttributes = document.createElement("div");
  this._genericMotionAttributes.innerHTML = "Frequency <input type='number' name='freq' style='margin-bottom:0.5em'><br>"+
                                "Phase <input type='number' name='phase' style='margin-bottom:0.5em'>";
  this._swingAttributes = document.createElement("div");
  this._swingAttributes.innerHTML = "Amplitude <input type='number' name='amp' style='margin-bottom:0.5em'><br>"+
                                "Frequency <input type='number' name='freq' style='margin-bottom:0.5em'><br>"+
                                "Phase <input type='number' name='phase' style='margin-bottom:0.5em'>";


  //sprite
  this._actorSprite = document.createElement("div");
  this._actorSprite.className = "sprite-editor";
  this._actorSprite.innerHTML = "Total Frames <input type='number' name='frames' style='margin-bottom:0.5em'><br>"+
                                "Initial Frame <input type='number' name='current' style='margin-bottom:0.5em'><br>"+
                                "Frame Period (ms) <input type='number' name='period' style='margin-bottom:0.5em'><br>"+
                                "Frame Width <input type='number' name='width' style='margin-bottom:0.5em'><br>"+
                                "Frame Height <input type='number' name='height' style='margin-bottom:0.5em'>";

  //audiotrack
  this._audiotrackEditor = document.createElement("div");
  this._audiotrackEditor.className = "audiotrack-editor";
  this._audiotrackEditor.style.cssText = "padding:0;"
  //audiotrack > volume
  this._audiotrackEditor.innerHTML += "Volume ";
  this._audiotrackVolume = document.createElement("input");
  this._audiotrackVolume.setAttribute("type", "number");
  this._audiotrackVolume.setAttribute("name", "volume");
  this._audiotrackEditor.className = "audiotrack-volume";
  this._audiotrackEditor.appendChild(this._audiotrackVolume);

  //--Functions--//

  this.editAsset = function(asset, baseURL) {
    if(typeof baseURL=="undefined" || baseURL==null) {baseURL = "";}

    if(asset=="actor") {
      asset = {};
      asset.name = "";
      asset.type = "actor";
      asset.url = "";
      asset.settings = {};
      asset.settings.x = 0;
      asset.settings.y = 0;
      asset.settings.z = 1;
      asset.settings.motion = {};
    } if(asset=="audiotrack") {
      asset = {};
      asset.name = "";
      asset.type = "audiotrack";
      asset.url = "";
      asset.settings = {};
      asset.settings.volume = 1;
    }

    this._currentAsset = asset;
    // console.log(asset);

    this._assetSettings.innerHTML="";

    this._containerBody.children["name"].value = asset.name;
    this._containerBody.children["url"].value = asset.url;

    if(asset.type=="actor") {
      this._containerBody.children[0].setAttribute("src", this._addBaseToURL(asset.url, baseURL));
      this._actorEditor.children[0].children["x"].value = asset.settings.x;
      this._actorEditor.children[0].children["y"].value = asset.settings.y;
      this._actorEditor.children[0].children["z"].value = asset.settings.z;
      if(typeof asset.settings.motion!="undefined" && asset.settings.motion!=null && asset.settings.motion.type!=null) {
        //Motion
        this._actorTypeSelector.value = "motion";
        this._actorTypeSelectorOnChange();
        this._actorEditor.children[3].children[0].children["type"].value = asset.settings.motion.type;
        this._actorEditor.children[3].children[0].children[2].children[0].children["freq"].value = asset.settings.motion.freq;
        this._actorEditor.children[3].children[0].children[2].children[0].children["phase"].value = asset.settings.motion.phase;
        if(asset.settings.motion.type=="swing") {this._actorEditor.children[3].children[0].children[2].children[0].children["amp"].value = asset.settings.motion.amp;}
      } else if(asset.settings.sprite!=null) {
        //Sprite
        this._actorTypeSelector.value = "sprite";
        this._actorTypeSelectorOnChange();
        this._actorEditor.children[3].children[0].children["frames"].value = asset.settings.sprite.frames;
        this._actorEditor.children[3].children[0].children["current"].value = asset.settings.sprite.current;
        this._actorEditor.children[3].children[0].children["period"].value = asset.settings.sprite.period;
        this._actorEditor.children[3].children[0].children["width"].value = asset.settings.sprite.width;
        this._actorEditor.children[3].children[0].children["height"].value = asset.settings.sprite.height;
      } else {
        //Static
        this._actorTypeSelector.value = "static";
        this._actorTypeSelectorOnChange();
      }
      this._assetSettings.appendChild(this._actorEditor);
    } else if(asset.type=="audiotrack") {
      this._containerBody.children[0].setAttribute("src","");
      this._audiotrackVolume.value = asset.settings.volume;
      this._assetSettings.appendChild(this._audiotrackEditor);
    }
  }

  this.getResult = function() {
    var updatedAsset = {};
    updatedAsset.name = this._containerBody.children["name"].value;
    updatedAsset.url = this._containerBody.children["url"].value;
    //updatedAsset.settings = {};
    if(this._currentAsset.type=="actor") {
      updatedAsset.x = this._actorEditor.children[0].children["x"].value*1;
      updatedAsset.y = this._actorEditor.children[0].children["y"].value*1;
      updatedAsset.z = this._actorEditor.children[0].children["z"].value*1;
      if(this._actorEditor.children["type"].value=="motion") {
        updatedAsset.motion = {};
        updatedAsset.motion.type = this._actorEditor.children[3].children[0].children["type"].value;
        updatedAsset.motion.freq = this._actorEditor.children[3].children[0].children[2].children[0].children["freq"].value*1;
        updatedAsset.motion.phase = this._actorEditor.children[3].children[0].children[2].children[0].children["phase"].value*1;
        if(updatedAsset.motion.type=="swing") {updatedAsset.motion.amp = this._actorEditor.children[3].children[0].children[2].children[0].children["amp"].value*1;}
      } else if(this._actorEditor.children["type"].value=="sprite") {
        updatedAsset.sprite = {};
        updatedAsset.sprite.frames = this._actorEditor.children[3].children[0].children["frames"].value*1;
        updatedAsset.sprite.current = this._actorEditor.children[3].children[0].children["current"].value*1;
        updatedAsset.sprite.period = this._actorEditor.children[3].children[0].children["period"].value*1;
        updatedAsset.sprite.width = this._actorEditor.children[3].children[0].children["width"].value*1;
        updatedAsset.sprite.height = this._actorEditor.children[3].children[0].children["height"].value*1;
      }
    } else if(this._currentAsset.type=="audiotrack") {
      updatedAsset.volume = this._audiotrackVolume.value*1;
    }
    return updatedAsset;
  }

  this._getPathFromURL = function(url) {
    if(url==null) {return "";}

    var lastSlashIndex = url.lastIndexOf("/");
    if(lastSlashIndex>0) {
      return url.substr(0, lastSlashIndex+1);
    } else {
      return "";
    }
  }

  this._addBaseToURL = function(url, baseURL) {
    var protocolRegex = /[a-zA-Z0-9]+:\/\//g;

    // Absolute paths
    if(url[0]=="/" || protocolRegex.exec(url)!=null) {
      return url;
    }
    // Relative paths
    else {
      if(baseURL==null) {
        return url;
      } else {
        // Remove any files from the path
        return this._getPathFromURL(baseURL)+url;
      }
    }
  }

}
