var game = new Phaser.Game(800,600,Phaser.AUTO,'game',
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
  game.load.image("blueblock", "assets/blueblock.png",72,72);
  game.load.image("redblock", "assets/redblock.png",72,72);
  game.load.image("greenblock", "assets/greenblock.png",72,72);
  game.load.image("orangeblock", "assets/orangeblock.png",72,72);
  //game.load.image("uppipe", "assets/wormup.png");
  //game.load.image("downpipe", "assets/wormdown.png");
}

function create() {
  // Add physics and scroll background
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //background = game.add.tileSprite(0,0,320,568,"background");
  // Add the bird and set his animation and values
  blueblock = game.add.sprite(100, 245, 'blueblock');
  block.anchor.x = .5;
  block.anchor.y = .5;
  blueblock.scale.set(1);
  bird.animations.add('fly', [0,1,2,3], 10, true);
}
