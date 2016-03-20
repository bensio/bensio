var game = new Phaser.Game(800,600,Phaser.AUTO,'game',
  {preload:preload,create:create,update:update,render:render});

var block;
var blockCollisionGroup;
var blockVelocity = 30;
var money = 50;
var betMoney = 0;
var prompt;
var blocks;
var constrain = false; 
var gameOver = false;
var showTimer = true;
var goingToCenter = false;
var distanceToCenter;
var timer;

var textStyle = {
  align: 'center'
};

function preload() {
 
  //Center the game.
  this.game.scale.pageAlignHorizontally = true;this.game.scale.pageAlignVertically = true;this.game.scale.refresh();
  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.stage.backgroundColor = '#ffffff';
  //game.load.image("background","assets/bg.png");
  game.load.image("blue", "assets/bluesquare.png",72,72);
  game.load.image("red", "assets/redsquare.png",72,72);
  game.load.image("green", "assets/greensquare.png",72,72);
  game.load.image("orange", "assets/orangesquare.png",72,72);

  console.log("%c---Bootin' Bensio---", "color: #fff; background: #b800e6");
}

function create() {
  game.stage.disableVisibilityChange = true; 
  // Add physics
  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.setImpactEvents(true);
  blockCollisionGroup = game.physics.p2.createCollisionGroup(); 
  game.physics.p2.updateBoundsCollisionGroup();
  game.physics.p2.damping = 0;
  game.physics.p2.friction = 0;
  game.physics.p2.angularDamping = 0;
  game.physics.p2.restitution = 1;
  blocks = game.add.group();
  blocks.enableBody = true;
  blocks.physicsBodyType = Phaser.Physics.P2JS;
  //create blocks
  blue = blocks.create(200, 150, 'blue');
  red = blocks.create(200, 472, 'red');
  green = blocks.create(600, 150, 'green');
  orange = blocks.create(600, 472, 'orange');
  blocks.forEach(function(block) {
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.onBeginContact.add(hitBlock, this);
    block.anchor.x = 0.5;
    block.anchor.y = 0.5;
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;
    block.health = 20;
    block.isAlive = true;

  }, this);
  game.time.events.add(Phaser.Timer.SECOND * 10, startGame, this);
  promptBet();
}

function hitBlock (body,bodyB,shapeA,shapeB,equation) {
  if (body) {
    body.sprite.health -= 1;
    if (body.sprite.health < 1) {
      body.sprite.destroy();
    }
  } else {
    equation[0].bodyB.parent.sprite.health -= 1;
    if (equation[0].bodyB.parent.sprite.health < 1) {
      equation[0].bodyB.parent.sprite.destroy();
    }
  }
  if (blocks.length === 1 || blocks.length === 0) {
    gameOver = true;
  }
}

function tieGame() {


}

function startGame () {
  green.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  orange.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  blue.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  green.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  orange.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  blue.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  red.body.velocity.x = game.rnd.integerInRange(-1000,1000);
  red.body.velocity.y = game.rnd.integerInRange(-1000,1000);
  prompt.destroy();
  constrain = true;
  showTimer = false;
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
  prompt.font = 'Century Schoolbook';
  prompt.fontSize = 20;
  prompt.align = "center";
};

function updateTimer() {
  timeLeft = Math.floor(game.time.events.duration / 1000) + 1;
  prompt.setText("\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n" + timeLeft); 
};

function showResults(result) {
  gameOver = false;
  constrain = false;
  showTimer = false;
  if (result && result === "tie") {
    if (timer) {
      timer.destroy();
    }
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            "Looks like no one is the winner, whoops! No payout!");
    timer = game.time.events.add(Phaser.Timer.SECOND * 3, resetGame, this);
  } else {
    blocks.children[0].body.data.velocity[0] = 0;
    blocks.children[0].body.data.velocity[1] = 0;
    blocks.children[0].body.angularDamping = .3;
    accelerateToCenter(blocks.children[0], 500);
    goingToCenter = true;
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            blocks.children[0].key.capitalizeFirstLetter() + " is the winner!");
    timer = game.time.events.add(Phaser.Timer.SECOND * 10, resetGame, this);
  }
  prompt.anchor.setTo(0.5, 0.5);
  prompt.font = 'Century Schoolbook';
  prompt.fontSize = 20;
  prompt.align = "center";
}

function resetGame() {
  if (blocks.children[0]) {
    blocks.children[0].destroy();
  }
  constrain = false; 
  gameOver = false;
  showTimer = true;
  goingToCenter = false;
  prompt.destroy();
  blue = blocks.create(200, 150, 'blue');
  red = blocks.create(200, 472, 'red');
  green = blocks.create(600, 150, 'green');
  orange = blocks.create(600, 472, 'orange');
  blocks.forEach(function(block) {
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.onBeginContact.add(hitBlock, this);
    block.anchor.x = 0.5;
    block.anchor.y = 0.5;
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;
    block.health = 20;
    block.isAlive = true;
  }, this);
  promptBet();
  game.time.events.add(Phaser.Timer.SECOND * 10, startGame, this);
}

function accelerateToCenter(obj1, speed) {
    if (typeof speed === 'undefined') { speed = 60; }
    var angle = Math.atan2(game.world.centerY + 50 - obj1.y, game.world.centerX - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
    obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
    obj1.body.force.y = Math.sin(angle) * speed;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function update () {

  if (constrain != true && showTimer === true) {
      updateTimer();
  } else if (goingToCenter === true) {
      if (blocks.children[0]) {  
        
        if (Phaser.Math.distance(game.world.centerX, game.world.centerY + 50, blocks.children[0].body.sprite.x, blocks.children[0].body.sprite.y) < 3) {
              blocks.children[0].body.data.velocity[0] = 0;
              blocks.children[0].body.data.velocity[1] = 0;
        }
      } else {
            prompt.destroy();
            showResults("tie");
            goingToCenter = false;
      }
    }
  else {
    if (gameOver === false && constrain === true){
      blocks.forEach(function(block) {
        constrainVelocity(block,blockVelocity);
      }, this);
    } else if (gameOver === true && blocks.length === 1)  {
      showResults();
    } else if (gameOver === true && blocks.length === 0) {
      showResults("tie");
      }
  }
}


function render () {

}
