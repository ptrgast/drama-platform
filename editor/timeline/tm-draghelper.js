module.exports = function(draggable, container, onDrag) {

  //--Variables--//

  var thisobj = this;
  this._startEvent = null;

  //--Init--//

  this._mouseDownWrapper = function(event){thisobj._onMouseDown(event);}
  this._mouseMoveWrapper = function(event){thisobj._onMouseMove(event);}
  this._mouseUpWrapper = function(event){thisobj._onMouseUp(event);}
  draggable.addEventListener("mousedown", this._mouseDownWrapper);
  container.addEventListener("mousemove", this._mouseMoveWrapper);
  container.addEventListener("mouseup", this._mouseUpWrapper);

  //--Functions--//

  this._destruct = function() {
    draggable.removeEventListener("mousedown", this._mouseDownWrapper);
    container.removeEventListener("mousemove", this._mouseMoveWrapper);
    container.removeEventListener("mouseup", this._mouseUpWrapper);
  }

  this._onMouseDown = function(event) {
    event.stopPropagation();
    this._startEvent = event;
    var dragEvent = {
      dx:0,
      dy:0,
      started:true,
      ended:false
    };
    onDrag(dragEvent);
  }

  this._onMouseMove = function(event) {
    if(this._startEvent!=null && event.buttons==1) {
      event.stopPropagation();
      var dragEvent = {
        dx:event.clientX-this._startEvent.clientX,
        dy:event.clientY-this._startEvent.clientY,
        started:false,
        ended:false
      };
      onDrag(dragEvent);
    }
  }

  this._onMouseUp = function(event) {
    if(this._startEvent!=null) {
      event.stopPropagation();
      this._startEvent = null;
      var dragEvent = {
        dx:0,
        dy:0,
        started:false,
        ended:true
      };
      onDrag(dragEvent);
    }
  }

}
