// Displays the story title, the loading progress and the player status
module.exports = function(player) {
  var thisobj=this;

  //assets
  this.backImg="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAABmJLR0QAWgBaAFphdX+ZAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMFABArTJDQ0QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJ0lEQVRIx+3SMQ0AAAgDMHjx73eY4CFpNbSTTMG5Vgu1UAvUQi2+WeLJEjFyEsxJAAAAAElFTkSuQmCC";

  this.container=document.createElement("div");
  this.container.style.cssText="color:rgba(255,255,255,0.7);background:url("+this.backImg+") repeat center;background-color:rgba(200,200,200,.1);position:absolute;top:0;left:0;bottom:0;right:0;";
  this.textElement=document.createElement("div");
  this.textElement.style.cssText="position:absolute;width:100%;vertical-align:middle;text-align:center;font-size:2em;";
  this.container.appendChild(this.textElement);
  this.set=function(content) {
    if(content!=null) {
	  this.textElement.style.top=this.container.clientHeight/2-this.textElement.clientHeight/2+"px";
      this.textElement.innerHTML=content;
      this.container.style.visibility="visible";
    } else {
      this.container.style.visibility="hidden";
    }
  }

  this.onresize=function() {
	  this.textElement.style.top=this.container.clientHeight/2-this.textElement.clientHeight/2+"px";
  }

  player.eventsManager.addListener("resize",function(){thisobj.onresize()})
}
