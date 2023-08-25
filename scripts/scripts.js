window.addEventListener('load',function(){
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1400;
  canvas.height = 720;
  let score = 0;
  let gameOver = false;


  class InputHandler {
    constructor(){
      this.keys = [];
      this.touchTreshold = 50;
      this.touchX = 0;
      this.touchY = 0;
      window.addEventListener('keydown', e=> {
        if ((e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight")
            && this.keys.indexOf(e.key) === -1) {
          this.keys.push(e.key);
        }  else if (e.key === 'Enter' && gameOver) {
          restartGame();
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

      window.addEventListener('touchstart', e=>{
        this.touchX = e.changedTouches[0].pageX;
        this.touchY = e.changedTouches[0].pageY;
      });

      window.addEventListener('touchmove', e=> {
        const swapeDistanceX = e.changedTouches[0].pageX -this.touchX;
        const swapeDistanceY = e.changedTouches[0].pageY -this.touchY;
        if (swapeDistanceY < -this.touchTreshold && this.keys.indexOf('ArrowUp') === -1) {
          this.keys.push('ArrowUp');
        } else if (swapeDistanceY > this.touchTreshold && this.keys.indexOf('ArrowDown') === -1 ) {
          if (gameOver) restartGame();
        } else if (swapeDistanceX < -this.touchTreshold && this.keys.indexOf('ArrowLeft') === -1) {
          this.keys.push('ArrowLeft');
        } else if (swapeDistanceX > this.touchTreshold && this.keys.indexOf('ArrowRight') === -1) {
          this.keys.push('ArrowRight');
        }       
      });

      window.addEventListener('touchend', e=> {
        // const swapeDistanceX = e.changedTouches[0].pageX -this.touchX;
        // const swapeDistanceY = e.changedTouches[0].pageY -this.touchY;
        // if (swapeDistanceY < -this.touchTreshold) {
        //   this.keys.splice(this.keys.indexOf('ArrowUp'), 1);
        // } else if (swapeDistanceX < -this.touchTreshold) {
        //   this.keys.splice(this.keys.indexOf('ArrowLeft'), 1);
        // } else if (swapeDistanceX > this.touchTreshold) {
        //   this.keys.splice(this.keys.indexOf('ArrowRight'), 1);
        // }  

        this.keys = [];
       

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

    restart(){
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.frameY = 0;
      this.speedX = 0;
      this.speedY = 0;    }

  }

  const player = new Player(canvas.width, canvas.height);

  class EnemiesHandle {
    constructor(gamewidth,gameHeight){
      this.gameWidth = gamewidth;
      this.gameHeight = gameHeight;
      this.enemies = [];
      this.timeToNextEnemy = 0;
      this.enemyInterval = 2000;
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
        const dx = (enemy.x + enemy.width *1/2) - (player.x + player.width * 1/2);
        const dy = (enemy.y + enemy.height *1/2) - (player.y + player.height * 1/2);
        if (Math.sqrt( dx * dx + dy * dy) < (enemy.width + player.width) * 1/3) {
          gameOver = true;
        }
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

    restart(){
      this.enemies = [];
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
      if (this.x < -this.width) {
        this.markedDeletion = true;
        score += 1;
      }
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
      // if (this.x < -this.width) {
      //   this.markedDeletion = true;
      // }
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
      // if (this.x < -this.width) {
      //   this.markedDeletion = true;
      // }

      this.alpha += this.speedY;
      this.y = this.gameHeight *2/5 + this.gameHeight * 1/5 * Math.sin(this.alpha);
    }
  }

  
  class Spider extends Enemy{
    constructor(game) {
      super(game);
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth * 1/2;
      this.height = this.spriteHeight * 1/2;
      this.x = Math.random() * (this.gameWidth - this.width) * 1/3 + this.gameWidth * 2/3;
      this.y = 0;
      this.speedX = 2;
      this.speedY = Math.random() * 5 + 5;
      this.image = spider;
    }

    update(deltaTime) {
      super.update(deltaTime);
      this.y += this.speedY;
      this.x -= this.speedX;
      // if (this.x < -this.width) {
      //   this.markedDeletion = true;
      // };
      if (this.y >= (this.gameHeight - this.height) || this.y <= 0) {
        this.speedY = -this.speedY;
      };
    }

    draw(ctx){
      super.draw(ctx);
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 1/2, 0);
      ctx.lineTo(this.x +this.width * 1/2, this.y);
      ctx.stroke();
    }
  }

  class Background {
    constructor(){
      this.width = 2400;
      this.height = 720;
      this.speedX = 2;
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

    restart(){
      this.x = 0;
    }
  }

  function displayScore(cxt) {
    ctx.textAlign = 'left';
    ctx.font = '40px Helvetica';
    ctx.fillStyle = 'black';    
    ctx.fillText('score:' + score, 20, 50);
    ctx.fillStyle = 'white';    
    ctx.fillText('score:' + score, 22, 52);
    if (gameOver) {
      ctx.textAlign = 'center';
      ctx.font = '50px Helvetica';
      ctx.fillStyle = 'black';    
      ctx.fillText('GAME OVER: press Enter  or swipe down to restart game! ', canvas.width * 1/2, canvas.height * 1/2);
      ctx.fillStyle = 'red';    
      ctx.fillText('GAME OVER: press Enter  or swipe down to restart game! ', canvas.width * 1/2 +2, canvas.height * 1/2 +2);
    }
  }
  

  let lastTime = 0;
  const inputHandler = new InputHandler();
  const enemiesHandle = new EnemiesHandle(canvas.width, canvas.height);
  const background = new Background();

  function restartGame(){
    player.restart();
    background.restart();
    enemiesHandle.restart();
    score = 0;
    gameOver = false;
    animate(0);
  }

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
    displayScore(ctx);
    if (!gameOver) {
      requestAnimationFrame(animate);
    };
  }
  animate(0);
});