module.exports = function() {

  var thisobj = this;
  this.items = new Array();

  this.add = function(actor) {
    //find new actor's position in queue
    var i=0;
    while((i<this.items.length)&&(actor.z>=this.items[i].z)) {i++;}
    //add the actor to the queue
    this.items.splice(i,0,actor);
  }

  this.remove = function(actor) {
    //find and remove the requested actor from the queue
    for(var i=0;i<this.items.length;i++) {
      if(this.items[i]==actor) {
        this.items.splice(i,1);
        return;
      }
    }
  }

  //Resets this draw queue
  this.reset = function() {
      this.items = new Array();
  }

  this.length = function() {
    return this.items.length;
  }

}
