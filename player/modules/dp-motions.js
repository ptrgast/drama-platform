//////////// Motion Functions ////////////
module.exports={

  vsin:function(t,actor) {
    actor.motion.x=0;
    actor.motion.y=10*Math.sin(drama.constants.PI360*actor.motion.freq*t);
  },

  ellipse:function(t,actor) {
    actor.motion.x=10*Math.cos(drama.constants.PI360*actor.motion.freq*t);
    actor.motion.y=5*Math.sin(drama.constants.PI360*actor.motion.freq*t);
  },

  swing:function(t,actor) {
    actor.motion.r=actor.motion.amp*Math.sin(drama.constants.PI360*actor.motion.freq*t+actor.motion.phase);
    actor.motion.x=0;
    actor.motion.y=0;
  },

  rotate:function(t,actor) {
    actor.motion.r=drama.constants.PI360*actor.motion.freq*t+actor.motion.phase;
    actor.motion.x=0;
    actor.motion.y=0;
  },

  sprite:function(t,actor) {
    actor.motion.current++;
    if(actor.motion.current>actor.motion.frames) {actor.motion.current=0;}
  }

};
