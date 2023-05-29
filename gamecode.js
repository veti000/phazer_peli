var config = {
    type: Phaser.AUTO,
    width: 1000, //2560, 1000
    height: 800, //1436, 800
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var music = '';
var jump = '';
var death = '';
var collect = '';

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/tausta.png');
    this.load.image('ground', 'assets/maa.png');
    this.load.image('star', 'assets/kolikko.png');
    this.load.image('bomb', 'assets/kallo.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
	this.load.audio('music', 'assets/musiikki.mp3');
	this.load.audio('jump', 'assets/jump.mp3');
	this.load.audio('death', 'assets/death.mp3');
	this.load.audio('collect', 'assets/coin-collect.mp3');
}

function create ()
{
    //  Tausta
    this.add.image(0, 0, 'sky').setOrigin(0, 0);

    //  Alustat
    platforms = this.physics.add.staticGroup();

    //  Maa
    platforms.create(2000, 1400, 'ground').setScale(4, 2).refreshBody();
	platforms.create(500, 1400, 'ground').setScale(4, 2).refreshBody();

    // Kielekeet
    platforms.create(225, 1200, 'ground');
	platforms.create(1600, 1200, 'ground');
	platforms.create(2400, 1200, 'ground');
	platforms.create(2000, 1025, 'ground');
	platforms.create(800, 1025, 'ground');
	platforms.create(1400, 850, 'ground');
	platforms.create(300, 850, 'ground');
	platforms.create(600, 675, 'ground');
	platforms.create(1900, 675, 'ground');
	platforms.create(1000, 500, 'ground');
	platforms.create(2200, 500, 'ground');
	platforms.create(2700, 675, 'ground');
	platforms.create(1600, 325, 'ground');
	platforms.create(300, 325, 'ground');

    // Pelaaja
    player = this.physics.add.sprite(1000, 1250, 'dude');

    // Pelaajan fysiikat
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Pelaajan animaatiot
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Näppäimet
    cursors = this.input.keyboard.createCursorKeys();

	//Tähtiä
    stars = this.physics.add.group({
        key: 'star',
        repeat: 99,
        setXY: { x: 10, y: 1100, stepX: 100}
    });
	
    stars.children.iterate(function (child) {

        // Satunnainen hyppy tähdille
        child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.7));
		child.x = Phaser.Math.FloatBetween(0, 2400);
		child.y = Phaser.Math.FloatBetween(0, 1300);

    });

    bombs = this.physics.add.group();

    //  Pisteet
    scoreText = this.add.text(16, 16, '$: 0', { fontSize: '32px', fill: '#FFFF00' });

    // Pelajan collission
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Kerää tähti
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
	
	//musiikki
	music = this.sound.add('music', {loop : true, volume: 0.3});
	music.play();
	
	// pelaajaa seuraava kamera
	this.physics.world.setBounds(0, 0, 2560, 1436);
	
	this.cameras.main.setBounds(0, 0, 2560, 1436);
	
	this.cameras.main.startFollow(player);
}

function update ()
{
	
	scoreText.x = this.cameras.main.worldView.x + 15;
	scoreText.y = this.cameras.main.worldView.y + 15;
	
    if (gameOver)
    {
		
        location.reload();
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-400);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(400);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
		
		//hyppy ääni
		jump = this.sound.add('jump', {loop : false});
		jump.play();
    }
	
	if (cursors.down.isDown)
	{
		player.setVelocityY(300);
	}
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    // Lisää ja päivitä pisteet
    score += 10;
    scoreText.setText('$: ' + score);
	
	//keräys ääni
	collect = this.sound.add('collect', {loop : false, volume: 0.5});
	collect.play();

    if (stars.countActive(true) === 0)
    {
        //  UUdet tähdet
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, child.y - 50, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
		
		var y = (player.y < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, y, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-300, 300), 30);
        bomb.allowGravity = false;
		
		var bomb = bombs.create(x + 300, y + 300, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-300, 300), 30);
        bomb.allowGravity = false;
		
		var bomb = bombs.create(x + 600, y + 600, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-300, 300), 30);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
	
	music.stop();
	
	death = this.sound.add('death', {loop : false});
	death.play();
}