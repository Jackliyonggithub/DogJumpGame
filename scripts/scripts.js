window.addEventListener('load',function(){
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1600;
  canvas.height = 720;

  class InputHandler {
    constructor(){
      this.keys = [];
      window.addEventListener('keydown', e=> {
        if ((e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight")
            && this.keys.indexOf(e.key) === -1) {
          this.keys.push(e.key);
        }  
      });

      window.addEventListener('keyup', e=> {
        if (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowLeft") {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }   
      });

    }
  }

  class Player {
    constructor(gameWidth,gameHeight){
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrameX = 5;
      this.frameY = 0;
      this.speedX = 0;
      this.speedY = 0;
      this.frameInterval = 50;
      this.timeToNextFrame = 0;
      this.image = playerImage;
      this.gravity = 1;
    }

    update(inputHandler,deltaTime){
      if (inputHandler.keys.indexOf('ArrowRight') > -1) {
        this.speedX = 5;
      } else if (inputHandler.keys.indexOf('ArrowLeft') > -1){
        this.speedX = -5;
      } else { this.speedX = 0};
      this.x += this.speedX;
      if (this.x < 0) {this.x = 0};
      if (this.x > this.gameWidth - this.width) {
        this.x = this.gameWidth - this.width};
      

      if (this.timeToNextFrame > this.frameInterval) {
        if (this.frameX > this.maxFrameX) {
          this.frameX = 0;
        } else this.frameX += 1;
        this.timeToNextFrame = 0;
      } else this.timeToNextFrame += deltaTime;

      if (this.onGround()){
        if (inputHandler.keys.indexOf('ArrowUp') > -1) {
          this.speedY = -25;
        } else {this.speedY = 0};
        this.frameY = 0;
      } else {
        this.speedY += this.gravity;
        this.frameY = 1;
      }
      this.y += this.speedY;

      if (this.onGround()) {
        this.y = this.gameHeight - this.height;
      }

    }

    draw(ctx){
      ctx.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
      
    }

    onGround(){
      return this.y >= this.gameHeight - this.height;
    }
  }

  class EnemiesHandle {
    constructor(gamewidth,gameHeight){
      this.gameWidth = gamewidth;
      this.gameHeight = gameHeight;
      this.enemies = [];
      this.timeToNextEnemy = 0;
      this.enemyInterval = 1000;
      this.typeOfEnemy = ['ghost', 'spider', 'worm'];
    }

    update(deltaTime) {
      if (this.timeToNextEnemy > this.enemyInterval) {
        this.#addEnemy();
        this.timeToNextEnemy = 0;
      } else this.timeToNextEnemy += deltaTime;
      this.enemies = this.enemies.filter(enemy => !enemy.markedDeletion);
      this.enemies.forEach(enemy => {
        enemy.update(deltaTime);
      });
    }

    draw(ctx) {
      this.enemies.forEach(enemy => {
        enemy.draw(ctx);
      });
      console.log(this.enemies)
    }

    
    #addEnemy(){
      const randomEnemy = this.typeOfEnemy[Math.floor(Math.random() * this.typeOfEnemy.length)];
      if (randomEnemy === 'worm') {        
        this.enemies.push(new Worm(this));
      } else if (randomEnemy === 'ghost') {    
        this.enemies.push(new Ghost(this));
      } else { 
        this.enemies.push(new Spider(this));
      }
    }
  }

  class Enemy {
    constructor(game){
      this.game = game;
      this.gameWidth = this.game.gameWidth;
      this.gameHeight = this.game.gameHeight;
      this.markedDeletion = false;
      this.frame = 0;
      this.maxFrame = 4;
      this.timeToNextFrame = 0;
      this.frameInterval = 50;
    }

    update(deltaTime){
      if (this.timeToNextFrame >this.maxFrame) {
        if (this.frame > this.maxFrame) {
          this.frame = 0;
        } else { this.frame += 1;}
        this.timeToNextFrame = 0;
      } this.timeToNextFrame += deltaTime;
    }

    draw(ctx) {
      ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
  }

  class Worm extends Enemy{
    constructor(game) {
      super(game);
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      this.width = this.spriteWidth * 1/2;
      this.height = this.spriteHeight *1/2;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.speedX = Math.random() * 3 + 3;
      this.image = worm;
      
    }

    update(deltaTime) {
      super.update(deltaTime);
      this.x -= this.speedX;
      if (this.x < -this.width) {
        this.markedDeletion = true;
      }
    }
  }

  class Ghost extends Enemy{
    constructor(game) {
      super(game);
      this.x = this.gameWidth;
      this.speedX = 5;
      this.speedY = 0.02 + Math.random() * 0.02;
      this.alpha = 0;
      this.y = this.gameHeight * 2/5;      
      this.speedX = Math.random() * 3 + 3;
      this.image = ghost;
      this.spriteWidth = 261;
      this.spriteHeight = 209;
      this.width = this.spriteWidth * 1/2;
      this.height = this.spriteHeight * 1/2;
    }

    update(deltaTime) {
      super.update(deltaTime);
      this.x -= this.speedX;
      if (this.x < -this.width) {
        this.markedDeletion = true;
      }

      this.alpha += this.speedY;
      this.y = this.gameHeight *2/5 + this.gameHeight * 1/3 * Math.sin(this.alpha);
    }
  }

  
  class Spider extends Enemy{
    constructor(game) {
      super(game);
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth * 1/2;
      this.height = this.spriteHeight * 1/2;
      this.x = Math.random() * (this.gameWidth - this.width);
      this.y = 0;
      this.speedY = Math.random() * 3 + 3;
      this.image = spider;
    }

    update(deltaTime) {
      super.update(deltaTime);
      this.y += this.speedY;
      if (this.y < -this.height) {
        this.markedDeletion = true;
      };
      if (this.y >= (this.gameHeight - this.height)) {
        this.speedY = -this.speedY;
      };
    }

    draw(ctx){
      super.draw(ctx);
    }
  }

  class Background {
    constructor(){
      this.width = 2400;
      this.height = 720;
      this.speedX = 5;
      this.backgroundCounter = 0;
      this.x = 0;
      this.image = backgroundImage;
    }

    update(){
      if (this.x === -this.width * (this.backgroundCounter + 1)) {
        this.backgroundCounter = 0;
        this.x = 0;
      } else {
        this.x -= this.speedX;
        if (this.x < -this.width * (this.backgroundCounter + 1 )){
        this.backgroundCounter += 1;}
      } 
    }

    draw(ctx){
      ctx.drawImage(this.image, this.x + this.width * this.backgroundCounter, 0, this.width, this.height);
      ctx.drawImage(this.image, this.x + this.width * (this.backgroundCounter + 1) -1, 0, this.width, this.height);
    }
  }

  let lastTime = 0;
  const inputHandler = new InputHandler();
  const enemiesHandle = new EnemiesHandle(canvas.width, canvas.height);
  const player = new Player(canvas.width, canvas.height);
  const background = new Background();
  function animate(timeStamp) { 
    const deltaTime = timeStamp - lastTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTime = timeStamp;
    background.update();
    background.draw(ctx);
    player.update(inputHandler,deltaTime);
    player.draw(ctx);
    enemiesHandle.update(deltaTime);
    enemiesHandle.draw(ctx);
    requestAnimationFrame(animate);
  }
  animate(0);
});