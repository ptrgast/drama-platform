module.exports = function() {

  var thisobj = this;

  //--Prototypes & Includes--//

  this.log = require("./../../common/mod-log.js");
  this.Popup = require("./../popup/popup.js");

  //--Variables--//

  this._maxItems = 8;
  this._historyKey = "url-history";
  this._popup = new this.Popup();
  this._handler = null;

  //--Elements--//

  this._historyContainer = document.createElement("div");
  this._historyContainer.style.padding = "1em";

  //--Functions--//

  this.show = function(handler) {
      this._handler = handler;

      var history = this.getAll();

      this._historyContainer.innerHTML = "";
      for(var i=0; i<history.length; i++) {
          var item = document.createElement("a");
          item.innerHTML = history[i].url;
          item.style.display = "block";
          item.style.marginBottom = "0.5em";
          item.setAttribute("href","javascript:");
          item.onclick = thisobj._onItemClicked;
          this._historyContainer.appendChild(item);
      }
      this._popup.show(
          "History",
          this._historyContainer,
          600,
          [{name:"Cancel", handler:function(){thisobj._popup.hide();}}]
      );
  }

  this._onItemClicked = function () {
      if(thisobj._handler!=null) {
          thisobj._handler(this.innerHTML);
      }
      thisobj._popup.hide();
  }

  this.getAll = function() {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return [];
      }

      var serializedHistory = localStorage.getItem(this._historyKey);
      if(serializedHistory==null || serializedHistory=="") {
          serializedHistory = "[]";
      }

      var history = JSON.parse(serializedHistory);
      history.sort(this._sort);
      return history;
  }

  this.save = function(url) {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return;
      }

      var history = this.getAll();

      // Check if url is already in history
      var index = -1;
      for(var i=0; i<history.length; i++) {
          if(history[i].url==url) {
              index = i;
              break;
          }
      }

      if(index>=0) {
          history[index].date = new Date().getTime();
      } else {
          history.push(new HistoryObject(url));
      }
      history.sort(this._sort);

      // Remove surplus items
      while(history.length>this._maxItems) {
          if(history.length-1<0) {break;}
          history.splice(history.length-1, 1);
      }

      // Serialize & store
      serializedHistory = JSON.stringify(history);
      localStorage.setItem(this._historyKey, serializedHistory);
  }

  this.remove = function(url) {
      if(typeof(Storage)=="undefined") {
        this.log.error("Web Storage is not supported by this browser!", this);
        return;
      }

      var history = this.getAll();

      // Find & remove
      for(var i=0; i<history.length; i++) {
          if(history[i].url==url) {
              history.splice(i, 1);
              break;
          }
      }

      // Serialize & store
      var serializedHistory = JSON.stringify(history);
      localStorage.setItem(this._historyKey, serializedHistory);
  }

  this._sort = function(a, b) {
      return b.date-a.date;
  }

}

function HistoryObject(url) {
    this.url = url;
    this.date = new Date().getTime();
}
