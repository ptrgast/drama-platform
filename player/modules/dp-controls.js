var VolumeControl=require("./dp-volumecontrol.js");

//PlayerControls
module.exports = function(player) {
	//prototypes
	this.LanguageSelector = require("./dp-languageselector.js");

	this.player=player;
	this.showTime=0; //when the controls showed up
	this.showDuration=1000; //how much time the controls stay visible (ms)
	this.visible=true;
	this.muted=false;
	this.volumeBeforeMute=0;
	var thisobj=this;

	//assets
	var imgPlay = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAlCAYAAADFniADAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADPSURBVFiF3ddJDsIwEETRAnEvcjQ4GeFkxaqSSJns2D2IL/XGi9ZbukFyJDmQRJYB59Lglqg0uC1UOO4IFYYrQbnjalBuuCsoc1wLygx3R3tPAB8AI4Chw74uKNUN1xOlmnEWKHUZZ4lS1TgPlCrGeaLUKS4CpXZxkSi1wt1IMhC01fsRLVj0BfACMGZATRg9RKJWGBWB2sUoT9QpRnmgijHKElWNURaoyxjVE9WMmcr4R/+baybV3WeOqUG5YUpQ7pgjVBhmCxWOWaLSYDQ/Y5CQxtZTdJkAAAAASUVORK5CYII=";
	var imgPause = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAlCAYAAAC+uuLPAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA/SURBVFiF7c2xDQAgEMNAwxSw/3CwRdgAfUGF7DZSriUJtSawL/sAVuWoF8GniYqKioqKioqKioqKioqKfo8eMekGRuKWtU8AAAAASUVORK5CYII=";
	var imgStop = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACISURBVEiJ7dY7DoAwDANQl5OVm3E0OJmZkECE0o9DFix16dA3xWkiSdyTjLuRZAALaAeik0mu50c9sAvihZmIGisiKqwKGcWakF6sC2nFhpBaTIK8YVLkSCLNunLJ9BX0Y+7YDGCTa4WR+GzOQhokpBtDWj9kn4Vs6iZUjRVRL8xEn1aMy494BwOtRMWypfpyAAAAAElFTkSuQmCC";
	var imgFullscreen = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAhCAYAAACr8emlAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKESURBVFiFzdjri01RGMfxz3EdzJwhXihRxAt5hZQyOJH79e/wT/CeN/4NEVLKTHJCIiWUlESRSxqZq9tge7HW6eyOPTN7zzlb86vVs56193n296y19rPWXpUkSUTNx1qsxwp0Y8k0JeseGG8pYxltWfcM4iVeYwIqSZL0R6g1mGt26Dfe4GUlSXVhTo1jGCMpm65DFb3Rpuu9mr2cS/NS9c94FsnT5V18+DBG479rR3PRE2F7sUoYvXTZhOUgaepMkiRmSTnTgJrTZm+Urv8JWMVhnMXDWJ9W86a/Zcbqxk7UYtmqmSX+4F6eIGUBnsepKeI/wVCeQGUN8Wk8nuJ6PW+gsgCHsN/kkPW8gcp8SX4ISb1Vf3Anb5CyABfhGnZEfzR17Sm+5A1UBmADbk/0b2CjsEpRYHjpPGAXrmJv9AdwUlgu9+C5goCdTDMLcQX7on8TJ/A9+p8EyG9FgnYKcCEu40D06zieAfOxaOCiQ9yNZS1tC3AJh6J/G0fxtShMlooC7hbm1dIU3EUcif7dWM9KLzNSUcCasKb2C58FF3AsXrsnbADGOgVH8TlYi3YbXmgO931hiEczftOWivRgFZtTfgPuEQ5qbvc7qiKAfbI/qn7iV2dw/lURwNok7dtxHYvbpslQJwBhF861h5KtvC9JD7a0tL0QEnKjfOgUVFp5AfuEr/06bkX7vgygVuUFHMCGMkEmU945WNpbOp3SRx/vhJzWOFF4G+1HIceNau5M2lWXMK+rWCmcJqzWPFnYIpw4KHo2MxFBR6aw4oN7prDz8z6wkiTJA6wT1tbZpEG8qqQ6sCqANmCXCMk3bbPaWq8RtlqNc7+vk9istkG8imUE/gLhyCouJy5X6QAAAABJRU5ErkJggg==";
	var imgSoundOn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAYAAADKO/UvAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACYSURBVEiJ7ZWxDcIwFAXPyBIdBQ2ZgVHYgD0YAFbIBJmEMlOwBAOgowGEImEltkXlJ/3K+td8615QKUgEetTc2apXCwB79eYrOYCDevcrSwEn9eEkc5fX6jBdXgLZqeMvgGoEzokTdsAR2KTuHLTsowCsSgEN0iANkp8IXBLvs1RQRUp/02M1UVetjGrl9Z5PjQbLPB2B/gnl1KjffFx79AAAAABJRU5ErkJggg==";
	var imgSoundOff = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAcCAYAAACQ0cTtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFbSURBVEiJ7Za9SgNBFIXPJvYRBNGwBMHWSvAF/AFfwNJ38BVsrSRIihQpUij2lpIXEBQRRSKC9iIIWn8Wu4PXdf93GiEHLuzOnJlvd6a4R4AaVAAcAr0CXwdQE9A8cEGklRxfH5gCYV3QGvDEj9JgATAwnkkd0B7wyW8lYQEwNPPPQK8KpA0ckS4LawEjMzcFQirc2QJwmQGysDYwNuOPQNftUwa0DrzkgBysDZyasXtgye4l4KBgozJaBc7N+x2wmPzwOfnRiaTd+PlW0rakt6Sp5QnmQNeSNtNAPmGSdCVpS9J7lsHXMd5I2pH0kWfy9Wf7RSCfsK8yJp93NoPNYP8MdiwpiGtZ0oOZP5O0IenVC820gC5Rs3Maxz2qSvPMLfcQErVvpxFRe68TC3JhPaJA4jQkCixNAk8mbGIWDQpAVaJcKswdYb/MAlNlQ+qfO+tUBLkqG78F6BuExuTwOsjTqwAAAABJRU5ErkJggg==";

	//create elements
	this.container = document.createElement("div");
  this.container.style.cssText = "position:absolute;bottom:0;width:100%;text-align:center;";

	this.controlsPanel = document.createElement("div");
	this.controlsPanel.style.cssText = "display:inline-block;background-color:rgba(0,0,0,0.3);margin-bottom:2.5%;padding:5px 20px;border-radius:15px;"+
		"-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;";
	this.container.appendChild(this.controlsPanel);

	this.mainControlsElem = document.createElement("div");
	this.languageSelector = new this.LanguageSelector();
	this.languageSelector.onselect = function(langIndex) {
		thisobj.player.setLanguage(langIndex);
		thisobj.controlsPanel.innerHTML="";
		thisobj.controlsPanel.appendChild(thisobj.mainControlsElem);
	}
	this.player.eventsManager.addListener("ready",function() {
		if(thisobj.player.story.languages.length!=0) {
			thisobj.languageSelector.setLanguages(thisobj.player.story.languages);
			thisobj.languageIndicator.innerHTML = thisobj.player.story.languages[thisobj.player.getLanguage()];
		} else {
			thisobj.languageIndicator.innerHTML = "";
		}
	});
	this.controlsPanel.appendChild(this.mainControlsElem);
	//this.controlsElement.style.cssText="display:inline-block;background-color:rgba(200,200,200,.2);margin-bottom:3%;padding:5px 20px;border-radius:15px;"+
	//	 "-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;";

	var controlsCss = "display:inline-block;width:40px;height:40px;margin:0 1px;cursor:pointer;";

	//play
	this.playButton=document.createElement("div");
    this.playButton.style.cssText=controlsCss+"background:url("+imgPlay+") no-repeat center;";
	this.playButton.onclick=function() {
		if(thisobj.player.started==0) {
			thisobj.player.play();
			thisobj.playButton.style.backgroundImage="url("+imgPause+")";
		} else {
			thisobj.player.pause();
			thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
		}
	}

	//stop
	this.stopButton=document.createElement("div");
  this.stopButton.style.cssText = controlsCss+"background:url("+imgStop+") no-repeat center;";
	this.stopButton.onclick = function() {
		thisobj.player.stop();
		thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
	}

	//fullscreen
	this.fullscreenButton = document.createElement("div");
  this.fullscreenButton.style.cssText = controlsCss+"background:url("+imgFullscreen+") no-repeat center;";
	this.fullscreenButton.onclick = function() {thisobj.player.toggleFullscreen();}

	//mute
	this.muteButton=document.createElement("div");
    this.muteButton.style.cssText = controlsCss+"background:url("+imgSoundOn+") no-repeat center;";
	this.muteButton.onclick = function() {
		if(thisobj.muted) {
			thisobj.muted=false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
			thisobj.player.setVolume(thisobj.volumeBeforeMute);
		} else {
			thisobj.muted=true;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOff+")";
			thisobj.volumeBeforeMute = thisobj.volumeControl.value;
			thisobj.player.setVolume(0);
		}
	}

	//volume
	this.volumeControl=new VolumeControl(0);
	this.volumeControl.container.style.display="inline-block";
	this.volumeControl.onvaluechange=function(value) {
		if(thisobj.muted) {
			thisobj.muted = false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
		}
		thisobj.player.setVolume(value, false);
	}
	this.player.eventsManager.addListener("volumechange",function(volume) {
		if(volume!=0 && thisobj.muted==true) {
			thisobj.muted=false;
			thisobj.muteButton.style.backgroundImage="url("+imgSoundOn+")";
		}
		thisobj.volumeControl.setValue(volume);
	});

	//time indicator
	this.timeIndicator = document.createElement("span");
	this.timeIndicator.style.cssText = "color:#ccc;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;";
	this.timeIndicator.innerHTML = "00:00";

	//language indicator
	this.languageIndicator = document.createElement("span");
	this.languageIndicator.style.cssText = "color:#fff;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;cursor:pointer;";
	this.languageIndicator.onclick = function() {
		thisobj.controlsPanel.innerHTML="";
		thisobj.controlsPanel.appendChild(thisobj.languageSelector.container);
	}
	this.player.eventsManager.addListener("languagechange", function(langIndex){
		thisobj.languageIndicator.innerHTML = thisobj.player.story.languages[langIndex];
	});
	//this.languageIndicator.innerHTML = "en";

	//append controls
  this.mainControlsElem.appendChild(this.stopButton);
  this.mainControlsElem.appendChild(this.playButton);
	this.mainControlsElem.appendChild(this.timeIndicator);
  this.mainControlsElem.appendChild(this.muteButton);
	this.mainControlsElem.appendChild(this.volumeControl.container);
	this.mainControlsElem.appendChild(this.languageIndicator);
	this.mainControlsElem.appendChild(this.fullscreenButton);

	this.setTime=function() {
		var time=(thisobj.player.time/1000)|0;
		var seconds=time%60;
		var minutes=(time/60|0)%60;
		if(seconds<10) {seconds="0"+seconds;}
		if(minutes<10) {minutes="0"+minutes;}
		thisobj.timeIndicator.innerHTML=minutes+":"+seconds;
	}

	this.onmousemove=function() {
		thisobj.showTime=thisobj.player.time;
		if(!thisobj.visible) {
			thisobj.container.style.display="block";
			thisobj.player.playerElement.style.cursor="auto";
			thisobj.visible=true;
		}
	}

	this.refresh=function() {
		thisobj.setTime();
		if(thisobj.visible&&thisobj.player.time-thisobj.showTime>thisobj.showDuration) {
			thisobj.container.style.display="none";
			thisobj.player.playerElement.style.cursor="none";
			thisobj.visible=false;

			//if not already return to the main controls
			thisobj.controlsPanel.innerHTML="";
			thisobj.controlsPanel.appendChild(thisobj.mainControlsElem);
		}
		if(thisobj.player.started==0) {
			thisobj.playButton.style.backgroundImage="url("+imgPlay+")";
		} else {
			thisobj.playButton.style.backgroundImage="url("+imgPause+")";
		}
	}

	setInterval(this.refresh,1000);
}
