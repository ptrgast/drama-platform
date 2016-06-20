module.exports = function(defaultOptions, userOptions) {

  var thisobj = this;

  this.defaultOptions = (defaultOptions==null)?{}:defaultOptions;
  this.userOptions = (userOptions==null)?{}:userOptions;

  this.get = function(param) {
    if(typeof this.userOptions[param]=="undefined") {
      if(typeof this.defaultOptions[param]=="undefined") {
        return null;
      } else {
        return this.defaultOptions[param];
      }
    }
  }

}
