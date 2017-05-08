module.exports = function(eventEditor) {

  var thisobj = this;

  //--Variables--//

  this._eventEditor = eventEditor;
  this.currentEvent = null;

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "audioevent-editor";
  this._container.style.cssText = "padding:0.5em";
  this._container.innerHTML = "Action ";
  //container > action selector
  this._actionSelect = document.createElement("select");
  this._actionSelect.innerHTML = "<option value='show'>Show</option>"+
                                  "<option value='hide'>Hide</option>"+
                                  "<option value='movelin'>Linear Movement</option>"+
                                  "<option value='movesin'>Sinusoid Movement</option>"+
                                  "<option value='teleport'>Teleportation</option>"+
                                  "<option value='fadein'>Fade In</option>"+
                                  "<option value='fadeout'>Fade Out</option>"+
                                  "<option value='fill'>Fill With Color</option>";
  this._actionSelect.onchange = function() {thisobj._showActionProperties(thisobj._actionSelect.value);}
  this._container.appendChild(this._actionSelect);
  this._container.appendChild(document.createElement("hr"));
  //container > properties container
  this._propertiesContainer = document.createElement("div");
  this._container.appendChild(this._propertiesContainer);
  //
  this._showProperties = new PropertyEditor([]);
  this._hideProperties = new PropertyEditor([]);
  this._movelinProperties = new PropertyEditor([{name:"tx", label:"Target X", type:"number"}, {name:"ty", label:"Target Y", type:"number"}]);
  this._movesinProperties = new PropertyEditor([{name:"tx", label:"Target X", type:"number"}, {name:"ty", label:"Target Y", type:"number"}]);
  this._teleportProperties = new PropertyEditor([{name:"x", label:"Target X", type:"number"}, {name:"y", label:"Target Y", type:"number"}, {name:"z", label:"Target Z", type:"number"}]);
  this._fillProperties = new PropertyEditor([{name:"color", label:"Color (Hex with #)"}]);
  this._fadeinProperties = new PropertyEditor([]);
  this._fadeoutProperties = new PropertyEditor([]);

  //--Functions--//

  this.edit = function(timelineEvent) {
    console.log(timelineEvent);
    if(timelineEvent!=null && typeof timelineEvent.actor=="string") {
      this.currentEvent = timelineEvent;
      var currentAction = timelineEvent.action.type;
      this._actionSelect.value = currentAction;
      var propertiesObject = this._getActionProperties(currentAction);
      if(currentAction=="movesin" || currentAction=="movelin") {
        propertiesObject.setValue("tx", timelineEvent.action.params.tx);
        propertiesObject.setValue("ty", timelineEvent.action.params.ty);
      } else if(currentAction=="teleport") {
        propertiesObject.setValue("x", timelineEvent.action.params.x);
        propertiesObject.setValue("y", timelineEvent.action.params.y);
        propertiesObject.setValue("z", timelineEvent.action.params.z);
      } else if(currentAction=="fill") {
        propertiesObject.setValue("color", timelineEvent.action.params.color);
      }
      this._showActionProperties(currentAction);
    }
  }

  this._getActionProperties = function(action) {
    if(action=="movelin") {
      return this._movelinProperties;
    } else if(action=="movesin") {
      return this._movesinProperties;
    } else if(action=="teleport") {
      return this._teleportProperties;
    } else if(action=="fill") {
      return this._fillProperties;
    } else if(action=="fadein") {
      return this._fadeinProperties;
    } else if(action=="fadeout") {
      return this._fadeoutProperties;
    } else if(action=="show") {
      return this._showProperties;
    } else if(action=="hide") {
      return this._hideProperties;
    }
  }

  this._showActionProperties = function(action) {
    var propertiesObject = this._getActionProperties(action);
    this._propertiesContainer.innerHTML = "";
    this._propertiesContainer.appendChild(propertiesObject._container);
  }

  this.save = function() {
    this.currentEvent.action.type = this._actionSelect.value;
    var propertiesObject = this._getActionProperties(this.currentEvent.action.type);
    if(typeof this.currentEvent.action.params=="undefined") {this.currentEvent.action.params = {};}
    propertiesObject.exportValues(this.currentEvent.action.params);
    console.log(this.currentEvent);
  }

}

function PropertyEditor(properties) {

  thisobj = this;

  //--Variables--//

  this._inputs = [];

  //--Elements--//

  //container
  this._container = document.createElement("div");
  this._container.className = "properties-editor";

  //--Functions--//

  this._init = function() {
    for(var i=0; i<properties.length; i++) {
      var type = "text";
      if(typeof properties[i].type!="undefined") {type = properties[i].type;}
      var input = this._createInput(properties[i].label, properties[i].name, type);
      this._container.appendChild(input);
    }
  }

  this._createInput = function(label, name, type) {
    var labelElem = document.createElement("label");
    labelElem.style.cssText = "display:block;margin-bottom:0.2em";
    labelElem.innerHTML = label+" ";
    var inputElem = document.createElement("input");
    labelElem.appendChild(inputElem);

    var inputObject = {
      name: name,
      type: type,
      element: inputElem
    };
    this._inputs.push(inputObject);

    return labelElem;
  }

  this.setValue = function(name, value) {
    for(var i=0; i<this._inputs.length; i++) {
      if(this._inputs[i].name==name) {
        this._inputs[i].element.value=value;
        return;
      }
    }
  }

  this.exportValues = function(receiver) {
    for(var i=0; i<this._inputs.length; i++) {
      if(this._inputs[i].type=="number") {
        receiver[this._inputs[i].name] = this._inputs[i].element.value*1;
      } else {
        receiver[this._inputs[i].name] = this._inputs[i].element.value;
      }
    }
  }

  this._init();
}
