module.exports = function() {

  var thisobj=this;
  this.listeners=[];

  this.addListener=function(event,handler) {
    //check that this handler is not already registered
    if(this._findListener(event,handler)<0) {
      var listener=new Listener(event,handler);
      this.listeners.push(listener);
    }
  }

  this.removeListener=function(event,handler) {
    var i=this._findListener(event,handler);
    if(i>=0) {
      this.listeners.splice(i,1);
    }
  }

  this.callHandlers=function(event,params) {
    for(var i=0;i<this.listeners.length;i++) {
      var currentListener=this.listeners[i];
      if(currentListener.event==event) {
        if(typeof params=="undefined") {
          currentListener.handler();
        } else {
          currentListener.handler(params);
        }
      }
    }
  }

  this._findListener=function(event,handler) {
    for(var i=0;i<this.listeners.length;i++) {
      var currentListener=this.listeners[i];
      if(currentListener.handler==handler && currentListener.event==event) {
        return i;
      }
    }
    return -1;
  }

}

function Listener(event, handler) {
  this.event=event;
  this.handler=handler;
}
