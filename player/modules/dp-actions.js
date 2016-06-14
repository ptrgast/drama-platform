//////////// Actions ////////////
var actions={};

//teleport
actions.teleport = {
    init:function(player,actor){
      actor.x = actor.action.params.x;
      actor.y = actor.action.params.y;
      actor.z = actor.action.params.z;
    },
    act:function(t,actor,params) {
      actor.action = null;
    }
}

//fade in
actions.fadein = {
    init:function(player,actor){
      actor.action.params.context=player.context;
      actor.action.params.width=player.story.width;
      actor.action.params.height=player.story.height;
      actor.action.params.a=-1/(actor.action.params.tt-player.time);
      actor.action.params.b=-actor.action.params.a*actor.action.params.tt;
      actor.action.params.st=player.time;
      actor.action.params.freq=1/(2*(actor.action.params.tt-player.time));
    },
    act:function(t,actor,params){
      color=(1+Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      params.context.fillStyle="rgba(0,0,0,"+color+")";
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//fade out
actions.fadeout = {
    init:actions.fadein.init,
    act:function(t,actor,params){
      color=(1+Math.cos(drama.constants.PI360*(t-params.st)*params.freq+drama.constants.PI180))/2;
      params.context.fillStyle="rgba(0,0,0,"+color+")";
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//fill canvas with color
actions.fill = {
    init:function(player,actor){
      actor.action.params.context=player.context;
      actor.action.params.width=player.story.width;
      actor.action.params.height=player.story.height;
    },
    act:function(t,actor,params){
      params.context.fillStyle=params.color;
      params.context.fillRect(0,0,params.width,params.height);
      if(t>=actor.action.params.tt) {actor.action=null;}
    }
}

//linear movement
actions.movelin = {
    init:function(player,actor){
      actor.action.params.ax=(actor.action.params.tx-actor.x)/(actor.action.params.tt-player.time);
      actor.action.params.ay=(actor.action.params.ty-actor.y)/(actor.action.params.tt-player.time);
      actor.action.params.bx=actor.x-actor.action.params.ax*player.time;
      actor.action.params.by=actor.y-actor.action.params.ay*player.time;
    },
    act:function(t,actor,params){
      actor.x=actor.action.params.ax*t+actor.action.params.bx;
      actor.y=actor.action.params.ay*t+actor.action.params.by;
      if(t>=actor.action.params.tt) {
        actor.x=params.tx;
        actor.y=params.ty;
        actor.action=null;
      }
    }
}

//sinusoid movement
actions.movesin = {
    init:function(player,actor){
      actor.action.params.st=player.time;
      actor.action.params.freq=1/(2*(actor.action.params.tt-player.time));
      actor.action.params.sy=actor.y;
      actor.action.params.dy=actor.y-actor.action.params.ty;
      actor.action.params.sx=actor.x;
      actor.action.params.dx=actor.x-actor.action.params.tx;
    },
    act:function(t,actor,params){
      actor.x=params.sx-params.dx*(1-Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      actor.y=params.sy-params.dy*(1-Math.cos(drama.constants.PI360*(t-params.st)*params.freq))/2;
      if(t>=actor.action.params.tt) {
        actor.x=params.tx;
        actor.y=params.ty;
        actor.action=null;
      }
    }
}

module.exports=actions;
