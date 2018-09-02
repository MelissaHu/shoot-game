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


































































