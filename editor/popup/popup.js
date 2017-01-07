module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this._ResizeDetector = require("./../../common/mod-resizedetector.js");

  //--Variables--//
  this._visible = false;
  this._okHandler = null;
  this._cancelHandler = null;
  this.resizeDetector = new this._ResizeDetector();
  this._defaultKeyDownHandler = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "popup-container";
  this._container.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(100,100,100,0.6); z-index:200";
  this._container.style.display = "none";
  //container > window
  this._windowElem = document.createElement("div");
  this._windowElem.className = "popup-window";
  this._windowElem.style.cssText = "position:relative; margin:auto; background-color:#f0f0f0; border-radius:3px; overflow-x:hidden; box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.4);";
  this._container.appendChild(this._windowElem);
  //container > window > titleContainer
  this._titleContainer = document.createElement("div");
  this._titleContainer.style.cssText ="width:100%; border-bottom:1px solid #e0e0e0;";
  this._windowElem.appendChild(this._titleContainer);
  //container > window > titleContainer > title
  this._titleElem = document.createElement("div");
  this._titleElem.style.cssText ="padding:0.5em";
  this._titleElem.innerHTML ="Popup";
  this._titleContainer.appendChild(this._titleElem);
  //container > window > body
  this._bodyElem = document.createElement("div");
  this._bodyElem.style.cssText ="width:100%;";
  this._windowElem.appendChild(this._bodyElem);
  //container > window > footer
  this._footer = document.createElement("div");
  this._footer.style.cssText ="padding:0.5em; text-align:right";
  this._windowElem.appendChild(this._footer);
  //container > window > footer > Cancel
  this._cancelButton = document.createElement("button");
  this._cancelButton.style.cssText = "margin-right:0.5em";
  this._cancelButton.innerHTML = "Cancel";
  this._footer.appendChild(this._cancelButton);
  //container > window > footer > ΟΚ
  this._okButton = document.createElement("button");
  this._okButton.innerHTML = "OK";
  this._footer.appendChild(this._okButton);

  //--Functions--//

  this._init = function() {
    document.body.appendChild(this._container);
  }
  window.addEventListener("load", function() {thisobj._init();});

  this._positionWindow = function() {
    height = this._windowElem.offsetHeight;
    this._windowElem.style.marginTop = this._container.offsetHeight/2-height/2+"px";
  }
  window.addEventListener("resize", function() {if(thisobj._visible) {thisobj._positionWindow();}});
  this.resizeDetector.watchElement(this._windowElem);
  this._windowElem.onresize = function() {thisobj._positionWindow();}

  this.show = function(title, element, width, onOk, onCancel) {
    this._visible = true;

    this._titleElem.innerHTML = title;
    this._bodyElem.innerHTML = "";
    this._bodyElem.appendChild(element);

    if(typeof width!="number") {width=500;}
    if(typeof height!="number") {height=400;}
    this._container.style.display = "block";
    this._windowElem.style.width = width+"px";
    this._positionWindow();

    if(typeof onOk=="function") {this._okHandler = onOk;}
    if(typeof onCancel=="function") {this._cancelHandler = onCancel;}

    this._defaultKeyDownHandler = window.onkeydown;
    window.onkeydown = this._onKeyDown;
  }

  this.hide = function() {
    this._visible = false;
    this._container.style.display = "none";
    window.onkeydown = this._defaultKeyDownHandler;
  }

  this._onKeyDown = function(event) {
    if(event.keyCode==27) {
      thisobj._onCancel();
    }
    event.stopPropagation();
  }

  this._onOK = function() {
    this.hide();
    if(typeof this._okHandler=="function") {this._okHandler();}
  }
  this._okButton.onclick = function() {thisobj._onOK();}

  this._onCancel = function() {
    this.hide();
    if(typeof this._cancelHandler=="function") {this._cancelHandler();}
  }
  this._cancelButton.onclick = function() {thisobj._onCancel();}

}
