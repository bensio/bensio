var game = new Phaser.Game(800,600,Phaser.AUTO,'game',
  {preload:preload,create:create,update:update,render:render});

var block;
var blockVelocity = 50;
var money = 50;
var betMoney = 0;
var prompt;
var timer;
WebFontConfig = {

//  'active' means all requested fonts have finished loading
//  We set a 1 second delay before calling 'createText'.
//  For some reason if we don't the browser cannot
// render the text the first time it's created.
  
  //                  //  The Google Fonts we want to load (specify as
  //                 many as you like in the array)
    google: {
        families: ['Press Start 2P']
          }
  
  };

var textStyle = {

  align: 'center'
};

function preload() {
 
  //Center the game.
  this.game.scale.pageAlignHorizontally = true;this.game.scale.pageAlignVertically = true;this.game.scale.refresh();


  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.stage.backgroundColor = '#ffffff';
  //game.load.image("background","assets/bg.png");
  game.load.image("blueblock", "assets/bluesquare.png",72,72);
  game.load.image("redblock", "assets/redsquare.png",72,72);
  game.load.image("greenblock", "assets/greensquare.png",72,72);
  game.load.image("orangeblock", "assets/orangesquare.png",72,72);

  console.log("%c---Bootin' Bensio---", "color: #fff; background: #b800e6");
}

function create() {
  
  
  // Add physics
  
  //game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.startSystem(Phaser.Physics.P2JS);

  var blockCollisionGroup = game.physics.p2.createCollisionGroup();

  game.physics.p2.updateBoundsCollisionGroup();

  game.physics.p2.damping = 0;
  game.physics.p2.friction = 0;
  game.physics.p2.angularDamping = 0;
  game.physics.p2.restitution = 1;


  //background = game.add.tileSprite(0,0,320,568,"background");
  
  blocks = game.add.group();
  blocks.enableBody = true;
  blocks.physicsBodyType = Phaser.Physics.P2JS;
  

  //create blocks
  blueblock = blocks.create(200, 150, 'blueblock');
  redblock = blocks.create(200, 400, 'redblock');
  greenblock = blocks.create(590, 150, 'greenblock');
  orangeblock = blocks.create(590, 400, 'orangeblock');

  
  blocks.forEach(function(block) {


    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);

    block.anchor.x = 0.5;
    block.anchor.y = 0.5;
    
    block.body.damping = 0;
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;

  }, this);

  //Set timers to start the game and prompt for a bet
  
  game.time.events.add(Phaser.Timer.SECOND * 11, startGame, this);


  game.time.events.add(Phaser.Timer.SECOND * 1, promptBet, this);

}

function startGame () {
  
  greenblock.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  orangeblock.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  blueblock.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  greenblock.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  orangeblock.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  blueblock.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  redblock.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  redblock.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  prompt.destroy();
}

function constrainVelocity(sprite, maxVelocity) {
  //constraints the block's velocity to a specific number
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  angle = Math.atan2(vy, vx);
    
  vx = Math.cos(angle) * maxVelocity;
  vy = Math.sin(angle) * maxVelocity;
    
  body.data.velocity[0] = vx;
  body.data.velocity[1] = vy;
};

function promptBet() {

  prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
      "\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n10");
  prompt.anchor.setTo(0.5, 0.5);
  prompt.font = 'Press Start 2P';
  prompt.fontSize = 20;
  prompt.align = "center";
};

function updateTimer() {
  seconds = Math.floor(game.time.now / 1000 - 1);
  timeLeft = 10 - seconds;
  prompt.setText("\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n" + timeLeft); 
};

function update () {

  if (game.time.now < 11000 && game.time.now > 2000) {
  updateTimer();
  
  }
  if (game.time.now > 11500) {
  constrainVelocity(redblock,blockVelocity);
  constrainVelocity(blueblock,blockVelocity);
  constrainVelocity(orangeblock,blockVelocity);
  constrainVelocity(greenblock,blockVelocity);
  }

  //game.input.onKeyDown
}


function render () {

}
