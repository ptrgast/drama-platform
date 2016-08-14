//////////// _CelladoorDebugConsole ////////////

//Player Info Box
module.exports = function(player) {
  //function _CelladoorDebugConsole(player) {
  this.player=player;
  this._previousTotalFrames = 0;

  //create elements
  this.container=document.createElement("div");
  this.container.style.cssText="color:white;background-color:rgba(100,100,100,.8);margin:10px;padding:10px;min-width:300px;position:absolute;right:0px;text-align:left;z-index:1;display:none";
  this.container.innerHTML="<div style='float:left;'>Player Info</div><div style='float:right;'>version "+player.PLAYER_VERSION+"</div><div style='clear:both'></div>";
  this.fpsbox=document.createElement("div");
  this.fpsbox.style.cssText="float:right;font-size:110%;";
  this.timebox=document.createElement("div");
  this.timebox.style.cssText="border-top:1px dotted white;";
  this.messagepanel=document.createElement("div");
  this.messagepanel.style.cssText="font-family:Courier,monospace;margin-top:10px;border-top:1px dotted white;";
  this.container.appendChild(this.fpsbox);
  this.container.appendChild(this.timebox);
  this.container.appendChild(this.messagepanel);

  var thisobj=this;

  this.setFPS=function(fps){ //set the fps label
    thisobj.fpsbox.innerHTML=fps+"fps";
  }

  this.setTime=function(msec){ //set the time label
    thisobj.timebox.innerHTML="time: "+Math.floor(msec/100)/10+"sec";
  }

  this.msg_queue=new Array();
  this.msg_max=22; //maximum number of messages in the queue
  this.print=function(txt){ //add a message in the debug console
    thisobj.msg_queue.push(txt);
    if(thisobj.msg_queue.length>this.msg_max){thisobj.msg_queue.splice(0,1);}
    var txt_queue="";
    for(var i=0;i<thisobj.msg_queue.length;i++){txt_queue+=thisobj.msg_queue[i]+"<br/>";}
    this.messagepanel.innerHTML=txt_queue;
  }

  this.refresh=function(){
    var fps = thisobj.player.framesCounter - thisobj._previousTotalFrames;
    thisobj.setFPS(fps);
    thisobj.setTime(thisobj.player.time);
    thisobj._previousTotalFrames = thisobj.player.framesCounter;
  }

  setInterval(this.refresh,1000);
  this.setFPS(0);
  this.setTime(0);

  return this;
}
