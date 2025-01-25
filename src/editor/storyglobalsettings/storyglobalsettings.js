module.exports = function() {

  var thisobj = this;

  //--Variables--//

  this._settings = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "story-gs-editor";
  this._container.style.cssText = "width:100%; height:100%;";
  //container > body
  this._containerBody = document.createElement("div");
  this._containerBody.className = "story-gs-editor-body";
  this._containerBody.style.cssText = "padding:0.5em";
  this._container.appendChild(this._containerBody);
  //container > title
  this._containerBody.innerHTML += "Story Title ";
  this._storyTitle = document.createElement("input");
  this._storyTitle.style.marginBottom = "0.5em";
  this._storyTitle.setAttribute("name", "title");
  this._containerBody.appendChild(this._storyTitle);
  //container > width
  this._containerBody.innerHTML += "<br>Width ";
  this._storyWidth = document.createElement("input");
  this._storyWidth.style.marginBottom = "0.5em";
  this._storyWidth.setAttribute("name", "width");
  this._containerBody.appendChild(this._storyWidth);
  //container > height
  this._containerBody.innerHTML += "<br>Height ";
  this._storyHeight = document.createElement("input");
  this._storyHeight.style.marginBottom = "0.5em";
  this._storyHeight.setAttribute("name", "height");
  this._containerBody.appendChild(this._storyHeight);

  //--Functions--//


  this.setCurrentSettings = function(settings) {
    this._settings = settings;
    this._containerBody.children["title"].value = settings.title;
    this._containerBody.children["width"].value = settings.width;
    this._containerBody.children["height"].value = settings.height;
  }

  this.settingsChanged = function() {
    var results = this.getResult();
    if(this._settings.title!=results.title) {return true;}
    if(this._settings.width!=results.width) {return true;}
    if(this._settings.height!=results.height) {return true;}
    return false;
  }

  this.getResult = function() {
    var settings = {};
    settings.title = this._containerBody.children["title"].value;
    settings.width = this._containerBody.children["width"].value*1;
    settings.height = this._containerBody.children["height"].value*1;
    return settings;
  }

}
