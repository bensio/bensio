var game = new Phaser.Game(1200,900,Phaser.AUTO,'game',{preload:preload,create:create,update:update,render:render});

var block;
var blockCollisionGroup;
var redCircleCollisionGroup;
var blueCircleCollisionGroup;
var purpleCircleCollisionGroup;
var blockVelocity = 30;
var money = 100;
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
var purpleCircles;
var purpleCircle;
var greeting;
var connected = "false";
var playerName;
var takeMessages;
var greeted = false;
var online = false;
var textStyle = {
  align: 'center',
  fill: "#000000"
};
var players;
var highStakes = false;
var player, //our player
        players = [], //this will hold the list of players
        sock, //this will be player's ws connection
        label,
        ip = "162.243.216.88"; //ip of our Go server
var purpleCircle;
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
  starbackground = game.load.image("starbackground","assets/stars1.png",1280,920);
  sunsetbackground = game.load.image("sunsetbackground","assets/sunset3.png",1280,920);
  westbackground = game.load.image("westbackground", "assets/west2.png", 1280,920);
  console.log("%c---Bootin' Bensio---", "color: #fff; background: #b800e6");
}

function create() {
  var backgrounds = Array("starbackground","sunsetbackground","westbackground");
  var backgroundchoice = backgrounds[Math.floor(Math.random()*backgrounds.length)]
  background = game.add.tileSprite(0,0,1280,920, backgroundchoice);
  if (backgroundchoice == "starbackground") {
    textStyle.fill = "#ffffff";
  }

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
  redCircleCollisionGroup = game.physics.p2.createCollisionGroup();
  redCircle = redCircles.create(game.world.centerX, game.world.centerY+405, 'redcircle');
  redCircle.anchor.x = .5;
  redCircle.anchor.y = .5;
  redCircle.inputEnabled = true;
  redCircle.input.enableDrag();
  redCircle.events.onDragStop.add(checkOutOfBounds, this);
 
  blueCircleCollisionGroup = game.physics.p2.createCollisionGroup();
  blueCircles = game.add.group();
  blueCircle = blueCircles.create(game.world.centerX + 100, game.world.centerY+405, 'bluecircle');
  blueCircle.anchor.x = .5;
  blueCircle.anchor.y = .5;
  blueCircle.inputEnabled = true;
  blueCircle.input.enableDrag();
  blueCircle.events.onDragStop.add(checkOutOfBounds, this);
 
  purpleCircleCollisionGroup = game.physics.p2.createCollisionGroup();
  purpleCircles = game.add.group();
  purpleCircle = purpleCircles.create(game.world.centerX - 100, game.world.centerY+405, 'purplecircle');
  purpleCircle.anchor.x = .5;
  purpleCircle.anchor.y = .5;
  purpleCircle.inputEnabled = true;
  purpleCircle.input.enableDrag();
  purpleCircle.events.onDragStop.add(checkOutOfBounds, this);

  sock = new WebSocket("ws://" + ip + ":8000/ws");
  sock.onopen = function() {
            var currency = JSON.stringify({
                money: money,
                betMoney: 0,
                playerName: playerName,
                online: false
            });
            sock.send(currency);
            connected = true;
            online = true;
        };
    
    sock.onmessage = function(message) {
            var m = JSON.parse(message.data);
            console.log(m);
            if (connected == true) {
              if (m.Money != 0) {
                if (players.indexOf(m.PlayerName) !== -1) {
                  console.log("Player found in current players list.");
                  if (m.BetMoney >= 100 && m.BetMoney >= m.Money / 2) {
                    if (greeted == false && m.PlayerName != playerName) {
                      greeting = game.add.text(m.PlayerName + " has bet " + m.BetMoney + " Benbux. \n\n\n High stakes!", textStyle);      
                      greeted = true;
                    } else {
                      greeting.setText(m.PlayerName + " has bet " + m.BetMoney + " Benbux. \n\n\n High stakes!", textStyle);   
                    }
                    greeting.anchor.setTo(0.5, 0.5);
                    greeting.font = 'Century Schoolbook';
                    greeting.fontSize = 20;
                    greeting.align = "center";
                    game.time.events.add(Phaser.Timer.SECOND * 3, killGreeting, this);
                    highStakes = true;
                  } if (m.ObsX && m.ObsY && showTimer == false && goingToCenter == false) {
                      if (m.Type == 'redCircle') {
                          spawnObstacle(m.ObsX, m.ObsY, 'redCircle');
                      } else if (m.Type == 'blueCircle') {
                          spawnObstacle(m.ObsX, m.ObsY, 'blueCircle');
                      } else if (m.Type == 'purpleCircle') {
                          spawnObstacle(m.ObsX, m.ObsY, 'purpleCircle');
                      }
                  }
                } else {
                  players.push(m.PlayerName);
                  if (greeted == true) {
                    greet(m);
                  }
                }
              }
            }
        };
  blocks.forEach(function(block) {
    block.body.setRectangleFromSprite();
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.collides(menuCollisionGroup);
    block.body.collides(redCircleCollisionGroup);
    block.body.collides(blueCircleCollisionGroup);
    block.body.collides(purpleCircleCollisionGroup);
    block.body.onBeginContact.add(hitBlock, this);
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;
    block.health = 20;
    block.isAlive = true;
    block.frozen = true;
    game.time.events.add(Phaser.Timer.SECOND * 10, unfreeze, this, block);
  }, this);
    menubar.body.collides(blockCollisionGroup);
    menubar.body.onBeginContact.add(hitBlock, this)
    game.time.events.add(Phaser.Timer.SECOND * 10, startGame, this);
    promptBet(); 
    if (greeted == false) {
      greeting = game.add.text(game.world.centerX, game.world.centerY - 300, "Welcome to Bensio, " + playerName + ".",textStyle);      
    }
    greeting.anchor.setTo(0.5, 0.5);
    greeting.font = 'Century Schoolbook';
    greeting.fontSize = 20;
    greeting.align = "center";
    game.time.events.add(Phaser.Timer.SECOND * 1, killGreeting, this);
}

/*
function checkOverlap(circle, rectangle) {
        circle = circle.getBounds();
        rectangle = rectangle.getBounds();
        return Phaser.Circle.intersectsRectangle(circle, rectangle);
        console.log(Phaser.Circle.intersectsRectangle(circle, rectangle));
}
*/

function spawnObstacle(x,y,type) {
        if (type == 'redCircle') {          
          redCircle = redCircles.create(x, y, 'redcircle');
          redCircle.anchor.x = .5
          redCircle.anchor.y = .5
          game.physics.p2.enable(redCircle);
          redCircle.body.setCircle(36);
          redCircle.body.setCollisionGroup(redCircleCollisionGroup);
          redCircle.body.collides(blockCollisionGroup);        
          redCircle.body.kinematic = true;          
        }

        else if (type = 'blueCircle') {          
          blueCircle = blueCircles.create(x, y, 'bluecircle');
          blueCircle.anchor.x = .5
          blueCircle.anchor.y = .5
          game.physics.p2.enable(blueCircle);
          blueCircle.body.setCircle(36);
          blueCircle.body.setCollisionGroup(blueCircleCollisionGroup);
          blueCircle.body.collides(blockCollisionGroup);
          blueCircle.body.onBeginContact.add(hitBlock, this);
          blueCircle.body.kinematic = true;
        }

        else if (type = 'purpleCircle') {
          purpleCircle = purpleCircles.create(x, y, 'purplecircle');
          purpleCircle.anchor.x = .5;
          purpleCircle.anchor.y = .5;
          purpleCircle.body.setCircle(36,0,0);
          purpleCircle.alpha = 1;
          purpleCircle.activated = true;
          game.physics.p2.enable(purpleCircle);
          purpleCircle.body.setCollisionGroup(purpleCircleCollisionGroup);
          purpleCircle.body.collides(blockCollisionGroup);
          purpleCircle.body.onBeginContact.add(hitblock, this);
          purpleCircle.body.kinematic = true;
          purpleCircle.body.data.shapes[0].sensor = true;
        }
}

function checkOutOfBounds(circle) {
      if (showTimer == true || circle.y >= game.world.centerY+315 || circle.y <= game.world.centerY-450 || circle.x + 32 >= game.world.centerX+600 || circle.x - 32 <= game.world.centerX-600){  // if distance to each other is smaller than ship radius and bullet radius a collision is happening (or an overlap - depends on what you do now)
        resetObstacle(circle);
      } else {
        game.physics.p2.enable(circle);
        circleShape = circle.body.setCircle(36,0,0);        
        if (redCircles.children.indexOf(circle) > -1) {          
          if (money - betMoney < 5) {
            circle.destroy();
          } else {
            money -= 5; 
            circle.body.setCollisionGroup(redCircleCollisionGroup);
            circle.body.collides(blockCollisionGroup);        
            circle.body.kinematic = true;
          }
          redCircle = redCircles.create(game.world.centerX, game.world.centerY+405, 'redcircle');
          redCircle.inputEnabled = true;
          redCircle.input.enableDrag();
          redCircle.anchor.x = .5
          redCircle.anchor.y = .5
          redCircle.events.onDragStop.add(checkOutOfBounds, this);
          type = "redCircle";
        }

        if (blueCircles.children.indexOf(circle) > -1) {          
          if (money - betMoney < 10) {
            circle.destroy();
          } else {
            money -= 10;
            circle.body.setCollisionGroup(blueCircleCollisionGroup);
            circle.body.collides(blockCollisionGroup);
            circle.body.onBeginContact.add(hitBlock, this);
            circle.body.kinematic = true;
          }
          blueCircle = blueCircles.create(game.world.centerX + 100, game.world.centerY+405, 'bluecircle');
          blueCircle.inputEnabled = true;
          blueCircle.input.enableDrag();
          blueCircle.anchor.x = .5;
          blueCircle.anchor.y = .5;
          blueCircle.events.onDragStop.add(checkOutOfBounds, this);
          type = "blueCircle";
        }  

      if (purpleCircles.children.indexOf(circle) > -1) {
          if (money - betMoney < 5) {
            circle.destroy();
          } else {
            money -= 5;
            circle.active = true;
            circle.body.setCollisionGroup(purpleCircleCollisionGroup);
            circle.body.collides(blockCollisionGroup);
            circleShape.sensor = true;
            circle.body.onBeginContact.add(hitBlock, this);
            circle.body.kinematic = true;
          }
          purpleCircle = purpleCircles.create(game.world.centerX - 100, game.world.centerY+405, 'purplecircle');
          purpleCircle.inputEnabled = true;
          purpleCircle.input.enableDrag();
          purpleCircle.anchor.x = .5;
          purpleCircle.anchor.y = .5;
          purpleCircle.events.onDragStop.add(checkOutOfBounds, this);
          type = "purpleCircle";
      }

        var obstacle = JSON.stringify({
          online: true,
          obsX: circle.x,
          obsY: circle.y,
          type: type
        });
        sock.send(obstacle);
      }
}

function resetObstacle(obstacle) {
 if (redCircles.children.indexOf(obstacle) > -1) {
    obstacle.x = game.world.centerX;
    obstacle.y = game.world.centerY+405;
 } else if (blueCircles.children.indexOf(obstacle) > -1) {
    obstacle.x = game.world.centerX + 100;
    obstacle.y = game.world.centerY + 405;
 } else if (purpleCircles.children.indexOf(obstacle) > -1) {
    obstacle.x = game.world.centerX - 100;
    obstacle.y = game.world.centerY + 405
 }
}

function startMessages() {
  takeMessages = true;
}

function greet(m) {
   var label = m.Id.match(/(^\w*)-/i)[1];
   game.time.events.add(Phaser.Timer.SECOND * 3, killGreeting, this); 
   greeting.setText(m.PlayerName + " has joined the game with " + m.Money + " Benbux. \n\n\n There are currently " + players.length + " players online.", textStyle);   
   greeting.anchor.setTo(0.5, 0.5);
   greeting.font = 'Century Schoolbook';
   greeting.fontSize = 20;
   greeting.align = "center";
   label.greeted = true;
   return label;
}

function killGreeting() {
  greeting.setText("");
  greeted = true;
  if (highStakes == true) {
    highStakes = false;
  }
}

function unfreeze(block) {
  if (block) {
    block.frozen = false;
  }
}

function hitBlock (body,bodyB,shapeA,shapeB,equation) { 
  if (body && body.sprite.key == "bluecircle" && equation[0].bodyB.parent.sprite) {
    equation[0].bodyB.parent.sprite.frozen = true;
    game.time.events.add(Phaser.Timer.SECOND * 2, unfreeze, this, equation[0].bodyB.parent.sprite);
    body.sprite.destroy();
  }
  else if (body && body.kinematic == false) {
      body.sprite.alpha -= .05;
      body.sprite.health -= 1;
      if (body.sprite.health < 1) {
        body.sprite.destroy();
      }
  } else {
    if (equation[0] && equation[0].bodyB.parent.sprite) {
      equation[0].bodyB.parent.sprite.alpha -= .05;
      equation[0].bodyB.parent.sprite.health -= 1;
      if (equation[0].bodyB.parent.sprite.health < 1) {
        equation[0].bodyB.parent.sprite.destroy();
      }
       if (body && body.sprite.key == "purplecircle") {
      equation[0].bodyB.parent.sprite.alpha = 1;
      equation[0].bodyB.parent.sprite.health += 2;
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
      "\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n10\n\n\n\nYou currently have " + money + " dollars.\n\nYou're betting " + betMoney + " dollars on " + bet + ".\n\nRed Circles cost 5, blue 10. Buy while the game is going on!",textStyle);
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
  //if (online === true) {
    sock.send(currency); 
    console.log(currency);
  //}
};


function updateTimer() {
  timeLeft = Math.floor(game.time.events.duration / 1000) + 1;
  prompt.setText("\n\n\nPlace your bets!\n\nRed, Green, Blue, or Orange?\n\n" + timeLeft + "\n\n\n\nYou currently have " + money + " dollars.\n\nYou're betting " + betMoney + " dollars on " + bet + ".\n\nRed Circles cost 5, blue 10. Buy obstacles while the game is going on!", textStyle); 
};

function showResults(result) { 
  redCircles.destroy(true,true);
  blueCircles.destroy(true,true);
  purpleCircles.destroy(true,true);
  gameOver = false;
  constrain = false;
  showTimer = false;
  if (result && result === "tie") {
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            "Looks like no one is the winner, whoops! No payout!",textStyle);
    timer = game.time.events.add(Phaser.Timer.SECOND * 3, resetGame, this);
    winner = "none";
    betMoney = 0;
  } else {
    blocks.children[0].health = 100;
    blocks.children[0].body.data.velocity[0] = 0;
    blocks.children[0].body.data.velocity[1] = 0;
    blocks.children[0].body.angularDamping = .3;
    accelerateToCenter(blocks.children[0], 1000);
    goingToCenter = true;
    prompt = game.add.text(game.world.centerX, game.world.centerY - 50,
            blocks.children[0].key.capitalizeFirstLetter() + " is the winner!",textStyle);
    if (!result) {
        timer = game.time.events.add(Phaser.Timer.SECOND * 10, resetGame, this);
    }
    winner = blocks.children[0].key;
  }
  prompt.anchor.setTo(0.5, 0.5);
  prompt.font = 'Century Schoolbook';
  prompt.fontSize = 20;
  prompt.align = "center";
};

/* did white people ruin america? find out tonight on CNN at 12 */ 
/* Donnovan pls */

function resetGame() {
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
  redCircle.anchor.x = .5;
  redCircle.anchor.y = .5;
  redCircle.inputEnabled = true;
  redCircle.input.enableDrag();
  redCircle.events.onDragStop.add(checkOutOfBounds, this);
  
  blueCircle = blueCircles.create(game.world.centerX + 100, game.world.centerY+405, 'bluecircle');
  blueCircle.anchor.x = .5;
  blueCircle.anchor.y = .5;
  blueCircle.inputEnabled = true;
  blueCircle.input.enableDrag();
  blueCircle.events.onDragStop.add(checkOutOfBounds, this);

  purpleCircle = purpleCircles.create(game.world.centerX - 100, game.world.centerY+405, 'purplecircle');
  purpleCircle.anchor.x = .5;
  purpleCircle.anchor.y = .5;
  purpleCircle.inputEnabled = true;
  purpleCircle.input.enableDrag();
  purpleCircle.events.onDragStop.add(checkOutOfBounds, this);
  purpleCircle.sensor = true;

  blocks.forEach(function(block) {
    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);
    block.body.collides(menuCollisionGroup);
    block.body.collides(redCircleCollisionGroup);
    block.body.collides(blueCircleCollisionGroup);
    block.body.collides(purpleCircleCollisionGroup);
    block.body.onBeginContact.add(hitBlock, this);
    block.anchor.x = 0.5;
    block.anchor.y = 0.5;
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = 0.1;
    block.body.restitution = 1;
    block.health = 20;
    block.isAlive = true;
    block.frozen = false;
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
        if (block.frozen == false) {
          constrainVelocity(block,blockVelocity);
        } else {
          constrainVelocity(block,0);
        }
      }, this);
      purpleCircles.forEach(function(purpleCircle) {
        if (purpleCircle.active == true) {
          if (purpleCircle.scale.x < 3 && purpleCircle.scale.y < 3) {
              purpleCircle.scale.x += .02;
              purpleCircle.scale.y += .02;
              purpleCircle.alpha -= .002;
            } 
          }
        }, this);
    } else if (gameOver === true && blocks.length === 1)  {
      showResults();
    } else if (gameOver === true && blocks.length === 0) {
      showResults("tie");
      }
  }
}


function render() {

}

