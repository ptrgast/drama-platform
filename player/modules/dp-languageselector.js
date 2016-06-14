module.exports = function() {

  var thisobj = this;

  //styles
  this._itemCss = "color:#fff;vertical-align:top;font-family:Sans-serif;font-size:28px;margin:0 15px;line-height:40px;cursor:pointer;";

  //elements
  this.container = document.createElement("div");

  this.onselect = null;

  this.setLanguages = function(languages) {
      //clear the container
      this.container.innerHTML = "";
      //add the available languages
      for(var i=0;i<languages.length;i++) {
        var currentButton = document.createElement("span");
        currentButton.style.cssText = this._itemCss;
        currentButton.innerHTML = languages[i];
        currentButton.langIndex = i;
        currentButton.onclick = function() {
          if(thisobj.onselect!=null) {thisobj.onselect(this.langIndex);}
        }
        this.container.appendChild(currentButton);
      }
  }

}
