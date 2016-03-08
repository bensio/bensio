var game = new Phaser.Game(800,600,Phaser.AUTO,'game',
  {preload:preload,create:create,update:update});
  {
  preload:preload,
  create:create,
  //update:update,
  //render:render
  });

var background;

function preload() {
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
  //game.physics.p2.restitution = 1;
  //game.physics.p2.applyDamping = false; 
  //game.physics.p2.applyGravity = false;
  

  var blockCollisionGroup = game.physics.p2.createCollisionGroup();

  game.physics.p2.updateBoundsCollisionGroup();

  game.physics.p2.damping = 0;
  game.physics.p2.friction = 0;
  game.physics.p2.angularDamping = 0;
  //game.physics.mass = .1;
  game.physics.p2.restitution = 1;


  //background = game.add.tileSprite(0,0,320,568,"background");
  
  blocks = game.add.group();
  blocks.enableBody = true;
  blocks.physicsBodyType = Phaser.Physics.P2JS;
  

  //create blocks
  blueblock = blocks.create(200, 150, 'blueblock');
  redblock = blocks.create(200, 300, 'redblock');
  greenblock = blocks.create(400, 150, 'greenblock');
  orangeblock = blocks.create(400, 300, 'orangeblock');

  //game.physics.p2.enable(blocks);
  
  blocks.forEach(function(block) {


    block.body.setCollisionGroup(blockCollisionGroup);
    block.body.collides(blockCollisionGroup);



    //block.body.collideWorldBounds = true; 
    //block.body.bounce.setTo(1,1);
    
    block.anchor.x = .5;
    block.anchor.y = .5;

  

    block.body.velocity.x = game.rnd.integerInRange(-1000,1000);
    block.body.velocity.y = game.rnd.integerInRange(-1000,1000);
    
    //block.body.velocity.x = 1000;
    //block.body.velocity.y = 1000;

    /*
    block.body.damping = 0;
    block.body.friction = 0;
    block.body.angularDamping = 0;
    block.body.mass = .1;
    block.body.restitution = 1;

   */
    //block.body.velocity.setTo(game.rnd.integerInRange(0,360),game.rnd.integerInRange(100,500));
    //block.body.collideWorldBounds = true;
    //block.body.allowRotation = true;
  }, this);
}

function update () {

 /* blocks.forEach(function(block) {
    block.body.velocity.x = 
    

  }, this);*/

                

}

