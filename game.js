var game = new Phaser.Game(800,600,Phaser.AUTO,'game',
  {preload:preload,create:create,update:update});

var background;

function preload() {
  game.stage.backgroundColor = '#ffffff';
  //game.load.image("background","assets/bg.png");
  game.load.image("blueblock", "assets/bluesquare.png",72,72);
  game.load.image("redblock", "assets/redsquare.png",72,72);
  game.load.image("greenblock", "assets/greensquare.png",72,72);
  game.load.image("orangeblock", "assets/orangesquare.png",72,72);
  //game.load.image("uppipe", "assets/wormup.png");
  //game.load.image("downpipe", "assets/wormdown.png");

}
function create() {
  // Add physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //background = game.add.tileSprite(0,0,320,568,"background");
  
  //Set properties of 'blocks' group
  blocks = game.add.group();
  //blocks.anchor.x = .5;
  //blocks.anchor.y = .5;


  //create blocks
  blueblock = blocks.create(200, 150, 'blueblock');
  redblock = blocks.create(200, 300, 'redblock');
  greenblock = blocks.create(400, 150, 'greenblock');
  orangeblock = blocks.create(400, 300, 'orangeblock');

  //blocks.anchor.x = .5;
  //blocks.anchor.y = .5;


  game.physics.enable(blocks, Phaser.Physics.ARCADE);
  
  blocks.forEach(function(block) {
  
    block.body.bounce.setTo(1,1);
    block.body.velocity.setTo(100 + Math.random() * 40,100);
    block.body.collideWorldBounds = true;
    block.body.allowRotation = true;
  }, this);
}

function update () {

  game.physics.arcade.collide(blocks, blocks);


}

