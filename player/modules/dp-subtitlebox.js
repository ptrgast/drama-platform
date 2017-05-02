//////////// SubtitleBox ////////////
module.exports = function() {
	this.container=document.createElement("div");
	this.container.style.cssText="position:absolute;bottom:0px;width:100%;text-align:center;";
	this.subtitleElement=document.createElement("span");
	this.subtitleElement.style.cssText="visibility:hidden;display:inline-block;margin:30px 30px 2% 30px;padding:5px 10px;max-width:900px;font-size:2em;font-family:sans-serif;"
																			+"color:rgba(255,255,255,0.8);text-shadow:-1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 1px 1px 0 rgba(0,0,0,0.5);";
	this.container.appendChild(this.subtitleElement);
	this.defaultDuration=4000;
	this.timer=null;
	var thisobj=this;

	this.setText=function(text,duration) {
		if(!duration) {duration=this.defaultDuration;}
		clearInterval(this.timer);
		this.timer=setInterval(thisobj.hide,duration);
		this.subtitleElement.innerHTML=text;
		thisobj.subtitleElement.style.visibility="visible";
	}

	this.hide=function() {
		clearInterval(thisobj.timer);
		thisobj.timer=null;
		thisobj.subtitleElement.innerHTML="";
		thisobj.subtitleElement.style.visibility="hidden";
	}

	this.setSize=function(em_size) {
		this.subtitleElement.style.fontSize = em_size+"em";
	}

}
