
// 元素
var container = document.getElementById('game');
var levelText = document.querySelector('.game-level');
var nextLevelText = document.querySelector('.game-next-level');
var scoreText = document.querySelector('.game-info .score');
var totalScoreText = document.querySelector('.game-failed .score');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// //获取画布相关信息
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

// 判断是否有 requestAnimationFrame 方法，如果有则模拟实现
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 30);
  };


/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function (opts) {
    this.opts = opts;  //设置opts
    this.status = 'start';
    //计算飞机对象初始坐标
    this.planePosX = canvasWidth / 2 - opts.planeSize.width;
    this.planePosY = canvasHeight - opts.planeSize.height - opts.canvasPadding;
    //飞机极限坐标
    this.planeMinX = opts.canvasPadding;
    this.planeMaxX = canvasWidth - opts.canvasPadding - opts.planeSize.width;
    //计算敌人移动区域
    this.enemyMinX = opts.canvasPadding;
    this.enemyMaxX = canvasWidth - opts.canvasPadding - opts.enemySize;

    //分数设置为0
    this.score = 0;
    this.enemies = [];
    this.keyBoard = new KeyBoard();

    this.bindEvent();
    this.renderLevel();
  },
  bindEvent: function () {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtn = document.querySelectorAll('.js-replay');
    var nextBtn = document.querySelector('.js-next');
    var stopBtn = document.querySelector('.js-stop');
    // 开始游戏按钮绑定
    playBtn.onclick = function () {
      self.play();
    };
    //重新开始游戏按钮绑定
    replayBtn.forEach(function (e) {
      e.onclick = function () {
        self.opts.level = 1;
        self.play();
        self.score = 0;
        totalScoreText.innerText = self.score;
      };
    });
    // 下一关游戏按钮绑定
    nextBtn.onclick = function () {
      self.opts.level += 1;
      self.play();
    };
    // 暂停游戏继续按钮绑定
    stopBtn.onclick = function () {
      self.setStatus('playing');
      self.animate();
    };
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function (status) {
    this.status = status;
    container.setAttribute('data-status', status);
  },
  play: function () { //playing 游戏中
    this.setStatus('playing');
    this.enemies = [];//清空敌人
    this.createElement('normal'); //创建敌人和飞机
    this.renderLevel(); //关卡级别
    this.animate();
  },
  //stop  游戏暂停
  stop: function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus('stop');
    return;
  },
  end: function (status) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus(status);
    totalScoreText.innerText = this.score;
    return;
  },
  //动画循环
  animate: function () { 
    var self = this;
    this.updateElement();    //更新元素
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);  //清理画布 
    this.draw();//绘制画布

    requestAnimationFrame(function () {     //不断循环animate
      if(self.status === 'stop'){
        return;
      }else{
        self.animate();
      }
    });
  },
  updateElement:function(){
    var opts = this.opts;
    var enemies = this.enemies;

     if (enemies.length === 0) {
      if (opts.level === opts.totalLevel) {
        this.end('all-success'); //通版
      } else {
        this.end('success');
      }
      return;
    }
    //查看敌人是否移动超过到敌人移动区域的底部边界
    if (enemies[enemies.length - 1].y >= this.planePosY - opts.enemySize) {
      this.end('failed');
      return;
    }

    
    //更新元素状态
    this.updatePanel();
    this.updateEnemeis();
  },
  updatePanel: function () {
    var plane = this.plane;
    var keyBoard = this.keyBoard;
    if (keyBoard.pressedEnter) {
      this.stop();
      return;
    }
    if (keyBoard.pressedLeft || keyBoard.heldLeft) {
      plane.direction('left');
    }
    if (keyBoard.pressedRight || keyBoard.heldRight) {
      plane.direction('right');
    }
    if (keyBoard.pressedUp || keyBoard.pressedSpace) {
      keyBoard.pressedUp = false;
      keyBoard.pressedSpace = false;
      plane.shoot();
    }
  },
  //更新敌人状态
  updateEnemeis: function () {
    var opts = this.opts;
    var plane = this.plane;
    var enemies = this.enemies;
    var i = enemies.length;
    var isFall = false;//敌人下移
    var enemiesBoundary=[];

    
    // 获取enemies的X最大值和最小值
    enemies.forEach(function(enemies){
       var ex = enemies.x;
       enemiesBoundary.push(ex);
    })
    var maxX = Math.max.apply(null,enemiesBoundary);
    var minX = Math.min.apply(null,enemiesBoundary);
   // 判断敌人是否改变运行方向
    if (minX < this.enemyMinX || maxX >= this.enemyMaxX) {
        opts.enemyDirection = opts.enemyDirection === 'right' ? 'left' : 'right';
      isFall = true;
    }


    //循环更新敌人
    while (i--) {
      var enemy = enemies[i];
      if (isFall) {
        enemy.down();
      }
      enemy.direction(opts.enemyDirection);
      switch (enemy.status) {
        case 'normal':
          if (plane.hasHit(enemy)) {
            enemy.booming();
          }
          break;
        case 'booming':
          enemy.booming();
          break;
        case 'boomed':
          enemies.splice(i, 1);
          this.score += 1;
          break;
        default:
          break;
      }
    }
  },
  //生成敌人
  createElement: function (enemyType) {
    var opts = this.opts;
    var level = opts.level;
    var enemies = this.enemies;
    var numPerLine = opts.numPerLine;
    var padding = opts.canvasPadding;
    var gap = opts.enemyGap;
    var size = opts.enemySize;
    var speed = opts.enemySpeed;
    //每升级一关敌人增加一行
    for (var i = 0; i < level; i++) {
      for (var j = 0; j < numPerLine; j++) {
        var initOpt = {
          x: padding + j * (size + gap),
          y: padding + i * (size + gap),
          size: size,
          speed: speed,
          status: enemyType,
          enemyIcon: opts.enemyIcon,
          enemyBoomIcon: opts.enemyBoomIcon
        };
        enemies.push(new Enemy(initOpt));
      }
    }
    //创建飞机
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      width: opts.planeSize.width,
      height: opts.planeSize.height,
      minX: this.planeMinX,
      speed: opts.planeSpeed,
      maxX: this.planeMaxX,
      planeIcon: opts.planeIcon
    });

  },
  draw: function () {
    this.renderScore();
    this.plane.draw();
    this.enemies.forEach(function (enemy) {
      enemy.draw();
    });
  },
  renderLevel: function () {
    levelText.innerText = '当前Level：' + this.opts.level;
    nextLevelText.innerText = '下一Level：' + (this.opts.level + 1);
  },
  renderScore: function () {
    scoreText.innerText = this.score;
  }
};


// 初始化
GAME.init(CONFIG);
