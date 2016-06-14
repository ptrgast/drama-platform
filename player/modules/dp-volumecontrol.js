module.exports = function(value) {
	//create elements
	this.container=document.createElement("div");
	this.container.style.cssText="position:relative;overflow:hidden;cursor:pointer;width:100px;height:20px;margin:10px 0;background-color:rgba(0,0,0,0.5)";
	this.handleElem=document.createElement("div");
	this.handleElem.style.cssText="width:0;height:100%;background:#ddd;border-right:2px solid #fff";
	this.container.appendChild(this.handleElem);

	this.width=parseInt(this.container.style.width);
	this.mouseDown=false;
	this.onvaluechange=null;
	this.value=0;
	var thisobj=this;

	//Sets the current volume for this object but does not call the
	//volumechange listener
	this.setValue=function(value) {
		if(value<0) {value=0;}
		else if(value>1) {value=1;}
		this.handleElem.style.width=((this.width*value)|0)+"px";
		this.value=value;
	}

	this.container.onmousedown=function(event) {
		if(!event) {event=window.event;}
		thisobj.mouseDown=true;
		thisobj.onmousemove(event);
	}

	this.onmouseup=function(event) {
		if(!event) {event=window.event;}
		thisobj.mouseDown=false;
	}

	this.onmousemove=function(event) {
		if(!event) {event=window.event;}
		if(thisobj.mouseDown) {
			var relX=event.clientX-thisobj.getHorizontalOffset();
			if(relX>thisobj.width) {relX=thisobj.width;}
			thisobj.setValue(relX/thisobj.width);
			if(thisobj.onvaluechange!=null) {thisobj.onvaluechange(thisobj.value);}
		}
	}

	this.getHorizontalOffset=function() {
		var offset=(this.container.clientWidth-this.width)/2;
		var element=this.container;
		do {
			offset+=element.offsetLeft;
			element=element.offsetParent;
		} while(element!=null);
		return offset;
	}

	document.addEventListener("mousemove",thisobj.onmousemove);
	document.addEventListener("mouseup",thisobj.onmouseup);

	if(value) {this.setValue(value);}
}
