module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//
  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "subtitle-editor";
  //container > subtitles container
  this._subtitlesContainer = document.createElement("div");
  this._subtitlesContainer.className = "subtitles";
  this._container.appendChild(this._subtitlesContainer);
  //container > footer
  this._footer = document.createElement("div");
  this._footer.className = "footer";
  this._footer.style.cssText = "padding:0.5em";
  this._container.appendChild(this._footer);
  //container > footer > add
  this._addButton = document.createElement("button");
  this._addButton.innerHTML = "Add";
  this._addButton.onclick = function(){thisobj._add();}
  this._footer.appendChild(this._addButton);

  //--Functions--//
  this.edit = function(timelineEvent) {
    this._subtitlesContainer.innerHTML = "";
    if(timelineEvent!=null && typeof timelineEvent.subtitle=="object") {
      this.currentEvent = timelineEvent;
      var items = Object.keys(timelineEvent.subtitle);
      for(var i=0; i<items.length; i++) {
        var newItem = new SingleLanguageEditor(items[i], timelineEvent.subtitle[items[i]]);
        this._subtitlesContainer.appendChild(newItem._container);
      }
    }
  }

  this.save = function() {
    var subtitles = {};
    var items = this._subtitlesContainer.getElementsByClassName("item");
    for(var i=0; i<items.length; i++) {
      var currentItem = items[i];
      var languageSelector = currentItem.getElementsByClassName("subtitle-language")[0];
      var language = languageSelector.options[languageSelector.selectedIndex].value;
      var textInput = currentItem.getElementsByClassName("subtitle-text")[0];
      subtitles[language] = textInput.value;
    }
    this.currentEvent.subtitle = subtitles;
    this._eventEditor.eventsManager.callHandlers("subtitlechanged");
  }

  this._add = function() {
    var newItem = new SingleLanguageEditor("en", "");
    this._subtitlesContainer.appendChild(newItem._container);
  }

}

function SingleLanguageEditor(language, subtitle) {

  var thisobj = this;

  //--Variables--//
  this._iso639_1 = ["ab","aa","af","ak","sq","am","ar","an","hy","as","av","ae","ay","az","bm","ba","eu","be","bn","bh","bi","bs",
                    "br","bg","my","ca","ch","ce","ny","zh","cv","kw","co","cr","hr","cs","da","dv","nl","dz","en","eo","et","ee",
                    "fo","fj","fi","fr","ff","gl","ka","de","el","gn","gu","ht","ha","he","hz","hi","ho","hu","ia","id","ie","ga",
                    "ig","ik","io","is","it","iu","ja","jv","kl","kn","kr","ks","kk","km","ki","rw","ky","kv","kg","ko","ku","kj",
                    "la","lb","lg","li","ln","lo","lt","lu","lv","gv","mk","mg","ms","ml","mt","mi","mr","mh","mn","na","nv","nd",
                    "ne","ng","nb","nn","no","ii","nr","oc","oj","cu","om","or","os","pa","pi","fa","pl","ps","pt","qu","rm","rn",
                    "ro","ru","sa","sc","sd","se","sm","sg","sr","gd","sn","si","sk","sl","so","st","es","su","sw","ss","sv","ta",
                    "te","tg","th","ti","bo","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa",
                    "cy","wo","fy","xh","yi","yo","za","zu"];

  //--Elements--//
  //container
  this._container = document.createElement("div");
  this._container.className = "item";
  this._container.style.cssText = "padding:0.5em;";
  //container>language select
  this._languageSelector = document.createElement("select");
  this._languageSelector.className = "subtitle-language"
  this._languageSelector.style.cssText = "margin-right:0.5em";
  var content = "";
  for(var i=0; i<this._iso639_1.length; i++) {
    var isoLang = this._iso639_1[i]
    content+="<option value='"+isoLang+"' "+(isoLang==language?"selected":"")+">"+isoLang+"</option>";
  }
  this._languageSelector.innerHTML = content;
  this._container.appendChild(this._languageSelector);
  //container>subtitle input
  this._subtitleInput = document.createElement("input");
  this._subtitleInput.className = "subtitle-text";
  this._subtitleInput.style.cssText = "margin-right:0.5em";
  this._subtitleInput.setAttribute("value", subtitle);
  this._container.appendChild(this._subtitleInput);
  //container>delete
  this._deleteButton = document.createElement("button");
  this._deleteButton.innerHTML = "Delete";
  this._deleteButton.onclick = function() {thisobj._delete();}
  this._container.appendChild(this._deleteButton);

  //--Functions--//
  this._delete = function() {
    this._container.parentElement.removeChild(this._container);
  }

}
