/*父类：包含x y speed move() draw()*/
var Element = function (opts) {
        this.opts = opts || {};
        //设置坐标和尺寸
        this.x = opts.x;
        this.y = opts.y;
        this.size = opts.size;
        this.speed = opts.speed;
};

Element.prototype.move = function (x, y) {
        var addX = x || 0;
        var addY = y || 0;
        this.x += addX;
        this.y += addY;
};

//继承原型的函数
function inheritPrototype(subType, superType) {
        var proto = Object.create(superType.prototype);
        proto.constructor = subType;
        subType.prototype = proto;
}

/*敌人*/
var Enemy = function (opts) {
    this.opts = opts || {};
    //调用父类方法
    Element.call(this, opts);

    //特有属性状态和图标
    this.status = 'normal';
    this.enemyIcon = opts.enemyIcon;
    this.enemyBoomIcon = opts.enemyBoomIcon;
    this.boomCount = 0;
};
//继承Element方法
inheritPrototype(Enemy, Element);

//方法：绘制敌人
Enemy.prototype.draw = function () {
    if (this.enemyIcon && this.enemyBoomIcon) {
        switch (this.status) {
            case 'normal':
                var enemyIcon = new Image();
                enemyIcon.src = this.enemyIcon;
                ctx.drawImage(enemyIcon, this.x, this.y, this.size, this.size);
                break;
            case 'booming':
                var enemyBoomIcon = new Image();
                enemyBoomIcon.src = this.enemyBoomIcon;
                ctx.drawImage(enemyBoomIcon, this.x, this.y, this.size, this.size);
                break;
            case 'boomed':
                ctx.clearRect(this.x, this.y, this.size, this.size);
                break;
            default:
                break;
        }
    }
};

//方法：down 向下移动
Enemy.prototype.down = function () {
    this.move(0, this.size);
};

//方法：左右移动
Enemy.prototype.direction = function (direction) {
    if (direction === 'right') {
        this.move(this.speed, 0);
    } else {
        this.move(-this.speed, 0);
    }
};

//方法：敌人爆炸得分
Enemy.prototype.booming = function () {
    this.status = 'booming';
    this.boomCount += 1;
    if (this.boomCount > 4) {
        this.status = 'boomed';
    }
}


/*子弹*/
var Bullet = function (opts) {
    this.opts = opts || {};
    Element.call(this, opts);
};
inheritPrototype(Bullet, Element);
//方法：子弹射出
Bullet.prototype.fly = function () {
    this.move(0, -this.speed);
};
//方法：绘制子弹
Bullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y - CONFIG.bulletSize);
    ctx.closePath();
    ctx.stroke();
};

/*飞机*/
var Plane = function (opts) {
    this.opts = opts || {};
    //调用父类方法
    Element.call(this, opts);

    //特有属性状态和图标
    this.status = 'normal';
    this.width = opts.width;
    this.height = opts.height;
    this.planeIcon = opts.planeIcon;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
    //子弹相关
    this.bullets = [];
    this.bulletSpeed = opts.bulletSpeed || CONFIG.bulletSpeed;
    this.bulletSize = opts.bulletSize || CONFIG.bulletSize;
};
//继承Element方法
inheritPrototype(Plane, Element);

//方法：子弹击中目标
Plane.prototype.hasHit = function (enemy) {
    var bullets = this.bullets;
    for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        var isHitPosX = (enemy.x < bullet.x) && (bullet.x < (enemy.x + enemy.size));
        var isHitPosY = (enemy.y < bullet.y) && (bullet.y < (enemy.y + enemy.size));
        if (isHitPosX && isHitPosY) {
            this.bullets.splice(i, 1);
            return true;
        }
    }
    return false;
};

//方法：绘制飞机
Plane.prototype.draw = function () {
    this.drawBullets();
    var planeIcon = new Image();
    planeIcon.src = this.planeIcon;
    ctx.drawImage(planeIcon, this.x, this.y, this.width, this.height);
};
//方法：飞机方向
Plane.prototype.direction = function (direction) {
    var speed = this.speed;
    var planeSpeed;
    if (direction === 'left') {
        planeSpeed = this.x < this.minX ? 0 : -speed;
    } else {
        planeSpeed = this.x > this.maxX ? 0 : speed;
    }
    this.move(planeSpeed, 0);
};
//方法：发射子弹
Plane.prototype.shoot = function () {
    var bulletPosX = this.x + this.width / 2;
    this.bullets.push(new Bullet({
        x: bulletPosX,
        y: this.y,
        size: this.bulletSize,
        speed: this.bulletSpeed
    }));
};
//方法：绘制子弹
Plane.prototype.drawBullets = function () {
    var bullets = this.bullets;
    var i = bullets.length;
    while (i--) {
        var bullet = bullets[i];
        bullet.fly();
        if (bullet.y <= 0) {
            bullets.splice(i, 1);
        }
        bullet.draw();
    }
};




//键盘事件
var KeyBoard = function () {
  document.onkeydown = this.keydown.bind(this);
  document.onkeyup = this.keyup.bind(this);
};
//KeyBoard对象
KeyBoard.prototype = {
  pressedLeft: false,
  pressedRight: false,
  pressedUp: false,
  heldLeft: false,
  heldRight: false,
  pressedSpace: false,
  pressedEnter: false,
  keydown: function (e) {
    var key = e.keyCode;
    switch (key) {
      case 32://空格-发射子弹
        this.pressedSpace = true;
        break;
      case 37://左方向键
        this.pressedLeft = true;
        this.heldLeft = true;
        this.pressedRight = false;
        this.heldRight = false;
        break;
      case 38://上方向键-发射子弹
        this.pressedUp = true;
        break;
      case 39://右方向键
        this.pressedLeft = false;
        this.heldLeft = false;
        this.pressedRight = true;
        this.heldRight = true;
        break;
      case 13://回车键-暂停游戏
        this.pressedEnter = true;
        break;
    }
  },
  keyup: function (e) {
    var key = e.keyCode;
    switch (key) {
      case 32:
        this.pressedSpace = false;
        break;
      case 37:
        this.heldLeft = false;
        this.pressedLeft = false;
      case 38:
        this.pressedUp = false;
        break;
      case 39:
        this.heldRight = false;
        this.pressedRight = false;
        break;
      case 13:
        this.pressedEnter = false;
        break;
    }
  }
};


































































