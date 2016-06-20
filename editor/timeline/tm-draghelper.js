module.exports = function(movableElement, parentElement, button) {
  var thisobj = this;

  //--prototypes--//
  this.log = require("./../../common/mod-log.js");

  //--variables--//
  this._logName = "DragHelper";
  this.movableElement = movableElement;
  this.parentElement = parentElement;
  this.acceptableButton = button;
  this.dragStart = null;

  //--value checks--//
  if(this.movableElement==null) {this.log.error("The 'movableElement' is missing!", this);}
  if(this.parentElement==null) {this.log.error("The 'parentElement' is missing!", this);}
  if(this.acceptableButton==null) {this.acceptableButton=0;}

  //--functions--//
  this.movableMouseDown = function(event) {
    if(event.button==thisobj.acceptableButton) {
      thisobj.dragStart = event.clientX;
      var allow = thisobj.onDragStart();
      if(typeof allow!="undefined" && allow==false) {
        //cancel drag
        thisobj.dragStart = null;
      }
    }
  }

  this.parentMouseMove = function(event) {
    if(thisobj.dragStart!=null) {
      var distance = event.clientX - thisobj.dragStart;
      thisobj.onDrag(distance);
    }
  }

  this.mouseUp = function(event) {
    if(thisobj.dragStart != null) {
      thisobj.dragStart = null;
      thisobj.onDragEnd();
    }
  }

  this.onDragStart = function() {};
  this.onDrag = function(distance) {};
  this.onDragEnd = function() {};

  //--register listeners--//
  this.movableElement.addEventListener("mousedown", this.movableMouseDown);
  this.parentElement.addEventListener("mousemove", this.parentMouseMove);
  this.movableElement.addEventListener("mouseup", this.mouseUp);
  this.parentElement.addEventListener("mouseup", this.mouseUp);
  document.addEventListener("mouseup", this.mouseUp);

}
