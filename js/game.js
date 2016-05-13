var game = new Phaser.Game(1200,900,Phaser.AUTO,'game',{preload:preload,create:create,update:update,render:render});

var block;
var blockCollisionGroup;
var blockVelocity = 30;
var money = 40;
var betMoney = 0;
var prompt;
var blocks;
var constrain = false; 
var gameOver = false;
var showTimer = true;
var goingToCenter = false;
var distanceToCenter;
var timer;
var bet = "none";
var winner = "none";
var bluebutton;
var redbutton;
var greenbutton;
var orangebutton;
var redCircle;
var greeting;
var connected = "false";
var playerName;
var takeMessages;
var greeted = false;
var online = 0;
var textStyle = {
  align: 'center'
};

var player, //our player
        players = [], //this will hold the list of players
        sock, //this will be player's ws connection
        label,
        ip = "162.243.216.88"; //ip of our Go server

//fs = require('fs');

function preload() { 
  //Center the game.
  this.game.scale.pageAlignHorizontally = true;this.game.scale.pageAlignVertically = true;this.game.scale.refresh();
  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.stage.backgroundColor = '#ffffff';
  game.load.image("blue", "assets/bluesquare.png",72,72);
  game.load.image("red", "assets/redsquare.png",72,72);
  game.load.image("green", "assets/greensquare.png",72,72);
  game.load.image("orange", "assets/orangesquare.png",72,72);
  game.load.image("bluecircle", "assets/blue-circle.png", 72, 72);
  game.load.image("redcircle", "assets/red-circle.png", 72, 72);
  game.load.image("purplecircle", "assets/purple-circle.png", 72, 72);

  game.load.image("menubar","assets/greenishbar.jpg",1200,90);
  console.log("%c---Bootin' Bensio---", "color: #fff; background: #b800e6");
}

function create() {
  if (localStorage && localStorage.getItem('money')) {
    money = parseInt(localStorage.getItem('money'));
  }
  if (localStorage && localStorage.getItem('name')) { 
    playerName = localStorage.getItem('name');
  } else {
    playerName = prompt("Welcome to Bensio! Enter a name for this computer here:","Name");    
    localStorage.setItem('name', playerName);
  }
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
  game.physics.p2.enable(blocks);
  blocks.enableBody = true;
  blocks.physicsBodyType = Phaser.Physics.P2JS;
  //create blocks
  blue = blocks.create(200, 150, 'blue');
  red = blocks.create(200, 744, 'red');
  green = blocks.create(1008, 150, 'green');
  orange = blocks.create(1008, 744, 'orange');
 
  menuCollisionGroup = game.physics.p2.createCollisionGroup();
  menubar = game.add.sprite(game.world.centerX, game.world.centerY+405, 'menubar');
  menubar.enableBody = true;
  game.physics.p2.enable(menubar);
  menubar.body.setCollisionGroup(menuCollisionGroup);
  menubar.body.kinematic = true;
 
  redCircles = game.add.group();
  //game.physics.p2.enable(redCircle);
  //405
  //redCircle.body.setCircle(36);
  
  redCircles.setAll('anchor.x', .5);
  redCircles.setAll('anchor.y', .5);
  redCircle = redCircles.create(game.world.centerX, game.world.centerY+405, 'redcircle');
  //redCircle.anchor.x = .5;
  //redCircle.anchor.y = .5;
  redCircle.inputEnabled = true;
  redCircle.input.enableDrag();
  redCircle.events.onDragStop.add(checkOutOfBounds, this);
  
  sock = new WebSocket("ws://" + ip + ":8000/ws");
  sock.onopen = function() {
            var currency = JSON.stringify({
                money: money,
                betMoney: 0,
                playerName: playerName,
                online: 0
            });
            sock.send(currency);
            connected = true;
            online = 1;
        };
    
    sock.onmessage = function(message) {
            var m = JSON.parse(message.data);
            if (connected == true) {
              if (m.Money != 0) {
                if (m.Online == 0) {
                  console.log("Player found in current players list.");
                  if (m.BetMoney > 100) {
                    if (greeted = false) {
                      greeting = game.add.text(m.PlayerName + " has bet " + m.BetMoney + " Benbux. \n\n\n High stakes!");      
                      greeted = true;
                    } else {
                      greeting.setText(m.PlayerName + " has bet " + m.BetMoney + " Benbux. \n\n\n High stakes!");   
                    }
                    greeting.anchor.setTo(0.5, 0.5);
                    greeting.font = 'Century Schoolbook';
                    greeting.fontSize = 20;
                    greeting.align = "center";
                    game.time.events.add(Phaser.Timer.SECOND * 3, killGreeting, this);
                  }
                } else {
                  //players.push(m.PlayerName);
                  greet(m);
                }
              }
            }
        };
  blocks.forEach(function(block) {
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.collides(menuCollisionGroup);
    block.body.onBeginContact.add(hitBlock, this);
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;
    block.health = 20;
    block.isAlive = true;
  }, this);
    menubar.body.collides(blockCollisionGroup);
    menubar.body.onBeginContact.add(hitBlock, this);
    game.time.events.add(Phaser.Timer.SECOND * 10, startGame, this);
    promptBet(); 
    if (greeted == false) {
      greeting = game.add.text(game.world.centerX, game.world.centerY - 300, "Welcome to Bensio, " + playerName + ".");      
    }
    greeting.anchor.setTo(0.5, 0.5);
    greeting.font = 'Century Schoolbook';
    greeting.fontSize = 20;
    greeting.align = "center";
    greeted = true;
    
  
    game.time.events.add(Phaser.Timer.SECOND * 3, killGreeting, this);
}

/*function askName() {
   greeting = game.add.text(game.world.centerX, game.world.centerY - 300, "Welcome to Bens.io! \n\n\n Type in a username you'd like to attach to this computer here:");   
   greeting.anchor.setTo(0.5, 0.5);
   greeting.font = 'Century Schoolbook';
   greeting.fontSize = 20;
   greeting.align = "center";

} */

function checkOutOfBounds(circle) {
      //var dx = circle.body.x-menubar.body.x;  //distance ship X to enemy X
      //var dy = circle.body.y-menubar.body.y;  //distance ship Y to enemy Y
      //var dist = Math.sqrt(dx*dx + dy*dy);     //pythagoras ^^  (get the distance to each other)
      if (circle.y >= game.world.centerY+315 || circle.y <= game.world.centerY-450 || circle.x + 32 >= game.world.centerX+600 || circle.x - 32 <= game.world.centerX-600){  // if distance to each other is smaller than ship radius and bullet radius a collision is happening (or an overlap - depends on what you do now)
        resetObstacle(circle);
      } else {
        if (redCircles.children.indexOf(circle) > -1) {          
          redCircle = redCircles.create(game.world.centerX, game.world.centerY+405, 'redcircle');
          //game.physics.p2.enable(redCircle);
          //405
          //redCircle.body.setCircle(36);
          redCircle.inputEnabled = true;
          redCircle.input.enableDrag();
          redCircle.anchor.x = .5
          redCircle.anchor.y = .5
          redCircle.events.onDragStop.add(checkOutOfBounds, this);
        }
      }
}

function resetObstacle(obstacle) {
 if (redCircles.children.indexOf(obstacle) > -1) {
    obstacle.x = game.world.centerX
    obstacle.y = game.world.centerY+405
 }
}

function startMessages() {
  takeMessages = true;
}

function greet(m) {
   var label = m.Id.match(/(^\w*)-/i)[1];
   game.time.events.add(Phaser.Timer.SECOND * 3, killGreeting, this);
   greeting.setText(m.PlayerName + " has joined the game with " + m.Money + " Benbux. \n\n\n There are currently " + players.length + " players online.");   
   greeting.anchor.setTo(0.5, 0.5);
   greeting.font = 'Century Schoolbook';
   greeting.fontSize = 20;
   greeting.align = "center";
   label.greeted = true;
   return label;
}

function killGreeting() {
  greeting.setText("");
}


function hitBlock (body,bodyB,shapeA,shapeB,equation) {
  if (body && body.kinematic == false) {
      console.log(body);
      body.sprite.alpha -= .05;
      body.sprite.health -= 1;
      if (body.sprite.health < 1) {
        body.sprite.destroy();
      }
  } else {
    if (equation[0].bodyB.parent.sprite) {
      equation[0].bodyB.parent.sprite.alpha -= .05;
      equation[0].bodyB.parent.sprite.health -= 1;
      if (equation[0].bodyB.parent.sprite.health < 1) {
        equation[0].bodyB.parent.sprite.destroy();
      }
    }
  }
  if (blocks.length === 1 || blocks.length === 0) {
    gameOver = true;
  }
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
  redbutton.destroy();
  greenbutton.destroy();
  bluebutton.destroy();
  orangebutton.destroy();
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
      "\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n10\n\n\n\nYou currently have " + money + " dollars.\n\nYou're betting " + betMoney + " dollars on " + bet + ".");
  prompt.anchor.setTo(0.5, 0.5);
  prompt.font = 'Century Schoolbook';
  prompt.fontSize = 20;
  prompt.align = "center";
  redbutton = game.add.button(164, 708, 'red', betOnBlock, {color: "red"});
  greenbutton = game.add.button(972, 114, 'green', betOnBlock, {color: "green"});
  bluebutton = game.add.button(164, 114, 'blue', betOnBlock, {color: "blue"});
  orangebutton = game.add.button(972, 708, 'orange', betOnBlock, {color: "orange"});
};

function betOnBlock() {
  if (bet != "none" && bet != this.color) {
    bet = this.color;
    betMoney = 10;
  } else if (betMoney < money) {
    bet = this.color;
    betMoney += 10;
  }
  var currency = JSON.stringify({
      money: money,
      betMoney : betMoney,
      online: online
  });
  if (connected === true) {
    sock.send(currency); 
    console.log(currency);
  }
}


function updateTimer() {
  timeLeft = Math.floor(game.time.events.duration / 1000) + 1;
  prompt.setText("\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n" + timeLeft + "\n\n\n\nYou currently have " + money + " dollars.\n\nYou're betting " + betMoney + " dollars on " + bet + "."); 
};

function showResults(result) {
  gameOver = false;
  constrain = false;
  showTimer = false;
  if (result && result === "tie") {
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            "Looks like no one is the winner, whoops! No payout!");
    timer = game.time.events.add(Phaser.Timer.SECOND * 3, resetGame, this);
    winner = "none";
    betMoney = 0;
  } else {
    blocks.children[0].body.data.velocity[0] = 0;
    blocks.children[0].body.data.velocity[1] = 0;
    blocks.children[0].body.angularDamping = .3;
    accelerateToCenter(blocks.children[0], 1000);
    goingToCenter = true;
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            blocks.children[0].key.capitalizeFirstLetter() + " is the winner!");
    if (!result) {
        timer = game.time.events.add(Phaser.Timer.SECOND * 10, resetGame, this);
    }
    winner = blocks.children[0].key;
  }
  prompt.anchor.setTo(0.5, 0.5);
  prompt.font = 'Century Schoolbook';
  prompt.fontSize = 20;
  prompt.align = "center";
}
/* did white people ruin america? find out tonight on CNN at 12 */ 
function resetGame() {
  redCircles.children.destroy();
  if (blocks.children[0]) {
    blocks.children[0].destroy();
  }
  if (bet === winner) {
    money = money + betMoney;
  } else if (winner != "none" && bet != winner) {
    money = money - betMoney;
    if (money <= 0) {
      money = 10;
    }
  }
  localStorage.setItem('money', money.toString());
  var currency = JSON.stringify({
     money: money,
     betMoney: 0,
     online: online
  });
  sock.send(currency);
  betMoney = 0; 
  bet = "none";
  winner = "none"
  constrain = false; 
  gameOver = false;
  goingToCenter = false;
  prompt.destroy();  
  blue = blocks.create(200, 150, 'blue');
  red = blocks.create(200, 744, 'red');
  green = blocks.create(1008, 150, 'green');
  orange = blocks.create(1008, 744, 'orange');
  
  
  redCircle = redCircles.create(game.world.centerX, game.world.centerY+405, 'redcircle');
  redCircle.inputEnabled = true;
  redCircle.input.enableDrag();
  redCircle.events.onDragStop.add(checkOutOfBounds, this);
  
  blocks.forEach(function(block) {
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.collides(menuCollisionGroup);
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
  showTimer = true;
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

function update() {
  if (constrain === false && showTimer === true) {
      updateTimer();
  } else if (goingToCenter === true) {
      if (blocks.children[0]) {  
       if (blocks.children[0].alpha < 1) {
          blocks.children[0].alpha += .01;
       }

        if (Phaser.Math.distance(game.world.centerX, game.world.centerY + 50, blocks.children[0].body.sprite.x, blocks.children[0].body.sprite.y) < 3) {
              blocks.children[0].body.data.velocity[0] = 0;
              blocks.children[0].body.data.velocity[1] = 0;
        }
      } else {
            prompt.destroy();
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


/*
function uMoney(m) { 
  total.money = m.Money
  players[m.Id].betMoney = m.BetMoney +       
}

*/
function render() {

}

