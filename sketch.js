let bgImage;
let walkSheet;
let stopSheet;
let jumpSheet;
let attackSheet;
let effectImage;


// ==================================================
// 基本設定
// ==================================================

let playerX;
let playerY;

let playerWidth;
let playerHeight;

let playerDirection = 1;
let currentAction = "stop";


// ==================================================
// 背景設定
// ==================================================

let backgroundX = 0;

const backgroundSpeed = 12;
const playerSpeed = 8;

let maxBackgroundMove = 0;

// 背景最後移動方向
// 1：背景向右
// -1：背景向左
let lastBackgroundDirection = 0;


// ==================================================
// 動畫速度
// ==================================================

let walkFrame = 0;
let walkTimer = 0;
let walkSpeed = 6;

let stopFrame = 0;
let stopTimer = 0;
let stopSpeed = 6;

let jumpFrame = 0;
let jumpTimer = 0;
let jumpSpeed = 6;

let attackFrame = 0;
let attackTimer = 0;
let attackSpeed = 5;


// ==================================================
// 跳躍設定
// ==================================================

let jumpStartY;
let jumpHeight;


// ==================================================
// 攻擊設定
// ==================================================

let isAttacking = false;
let showEffect = false;

let effectX;
let effectSpeed = 8;


// ==================================================
// 閃電設定
// ==================================================

let showLightning = false;
let lightningTimer = 0;
let lightningSpeed = 5;
let lightningSeed = 0;


// ==================================================
// 載入圖片
// ==================================================

function preload() {
  bgImage = loadImage("picture/bg.png");

  walkSheet = loadImage("picture/walk.png");
  stopSheet = loadImage("picture/stop.png");
  jumpSheet = loadImage("picture/jump.png");
  attackSheet = loadImage("picture/attack.png");

  effectImage = loadImage("picture/0.png");
}


// ==================================================
// 初始化
// ==================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);

  calculateDisplaySize();

  playerX = width / 2;
  playerY = height - playerHeight / 2;

  effectX = playerX;

  updateBackgroundLimit();
}


// ==================================================
// 主程式
// ==================================================

function draw() {
  background(128, 128, 128);

  calculateDisplaySize();

  // 繪製無縫背景
  drawBackground();

  // 攻擊期間
  if (isAttacking) {
    showLightning = false;

    playAttackAnimation();

    if (showEffect) {
      drawAttackEffect();
    }

    return;
  }

  // 跳躍期間
  if (currentAction === "jump") {
    showLightning = false;

    playJumpAnimation();
    return;
  }

  // 處理左右移動
  handleHorizontalMovement();

  // 限制角色位置
  constrainPlayerPosition();

  // 沒有按左右鍵時播放待機動畫
  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(RIGHT_ARROW)
  ) {
    currentAction = "stop";
    showLightning = false;

    playStopAnimation();
  }

  // 角色自由移動時顯示閃電
  if (showLightning) {
    updateLightning();
    drawLightning();
  }
}


// ==================================================
// 計算角色大小
// 角色高度為背景顯示高度的 1/3
// ==================================================

function calculateDisplaySize() {
  if (!bgImage) {
    return;
  }

  let backgroundScale =
    width / bgImage.width;

  let displayedBackgroundHeight =
    bgImage.height * backgroundScale;

  // 角色高度為背景顯示高度的 1/3
  playerHeight =
    displayedBackgroundHeight / 3;

  // 依 walk 每格圖片比例計算角色寬度
  let frameWidth =
    walkSheet.width / 9;

  let frameHeight =
    walkSheet.height;

  playerWidth =
    playerHeight *
    frameWidth /
    frameHeight;

  // 非跳躍時角色站在背景底部
  if (
    playerY !== undefined &&
    currentAction !== "jump"
  ) {
    playerY =
      height -
      playerHeight / 2;
  }

  updateBackgroundLimit();
}


// ==================================================
// 更新背景最大移動距離
// 背景最多移動背景顯示寬度的 2 倍
// ==================================================

function updateBackgroundLimit() {
  if (!bgImage) {
    return;
  }

  let backgroundScale =
    width / bgImage.width;

  let displayedBackgroundWidth =
    bgImage.width * backgroundScale;

  maxBackgroundMove =
    displayedBackgroundWidth * 2;
}


// ==================================================
// 繪製無縫背景
// ==================================================

function drawBackground() {
  let backgroundScale =
    width / bgImage.width;

  let displayedWidth =
    bgImage.width * backgroundScale;

  let displayedHeight =
    bgImage.height * backgroundScale;

  // 讓背景循環銜接
  let wrappedX =
    ((backgroundX % displayedWidth) +
      displayedWidth) %
    displayedWidth;

  for (
    let x = wrappedX - displayedWidth;
    x < width + displayedWidth;
    x += displayedWidth
  ) {
    image(
      bgImage,
      x + displayedWidth / 2,
      height - displayedHeight / 2,
      displayedWidth,
      displayedHeight
    );
  }
}


// ==================================================
// 處理左右移動
//
// 右鍵：背景向左移動
// 左鍵：背景向右移動
//
// 背景停止後，角色自由移動
// ==================================================

function handleHorizontalMovement() {
  let movingRight =
    keyIsDown(RIGHT_ARROW);

  let movingLeft =
    keyIsDown(LEFT_ARROW);

  let centerX =
    width / 2;

  // ==================================================
  // 按右鍵
  // 背景向左移動
  // ==================================================
  if (movingRight) {
    playerDirection = 1;
    currentAction = "walk";

    // 背景尚未到達左側極限
    if (
      backgroundX > -maxBackgroundMove &&
      playerX >= centerX
    ) {
      backgroundX -= backgroundSpeed;

      // 記錄背景最後移動方向：向左
      lastBackgroundDirection = -1;

      // 背景移動時角色固定在中央
      playerX = centerX;

      showLightning = false;
    }

    // 背景停止後，角色向右移動
    else {
      playerX += playerSpeed;

      showLightning = true;
      lightningSeed++;
    }

    playWalkAnimation();
  }

  // ==================================================
  // 按左鍵
  // 背景向右移動
  // ==================================================
  else if (movingLeft) {
    playerDirection = -1;
    currentAction = "walk";

    // 背景尚未到達右側極限
    if (
      backgroundX < maxBackgroundMove &&
      playerX <= centerX
    ) {
      backgroundX += backgroundSpeed;

      // 記錄背景最後移動方向：向右
      lastBackgroundDirection = 1;

      // 背景移動時角色固定在中央
      playerX = centerX;

      showLightning = false;
    }

    // 背景停止後，角色向左移動
    else {
      playerX -= playerSpeed;

      showLightning = true;
      lightningSeed++;
    }

    playWalkAnimation();
  }

  // 沒有按左右鍵
  else {
    showLightning = false;
  }
}


// ==================================================
// 限制角色在整個畫面內移動
// ==================================================

function constrainPlayerPosition() {
  let minX =
    playerWidth / 2;

  let maxX =
    width - playerWidth / 2;

  playerX =
    constrain(
      playerX,
      minX,
      maxX
    );
}


// ==================================================
// 行走動畫
// ==================================================

function playWalkAnimation() {
  let frameWidth =
    walkSheet.width / 9;

  let frameHeight =
    walkSheet.height;

  walkTimer++;

  if (walkTimer >= walkSpeed) {
    walkTimer = 0;
    walkFrame++;

    if (walkFrame >= 9) {
      walkFrame = 0;
    }
  }

  let sourceX =
    walkFrame * frameWidth;

  drawSprite(
    walkSheet,
    sourceX,
    0,
    frameWidth,
    frameHeight,
    playerX,
    playerY,
    playerDirection
  );
}


// ==================================================
// 待機動畫
// ==================================================

function playStopAnimation() {
  let frameWidth =
    stopSheet.width / 8;

  let frameHeight =
    stopSheet.height;

  stopTimer++;

  if (stopTimer >= stopSpeed) {
    stopTimer = 0;
    stopFrame++;

    if (stopFrame >= 8) {
      stopFrame = 0;
    }
  }

  let sourceX =
    stopFrame * frameWidth;

  drawSprite(
    stopSheet,
    sourceX,
    0,
    frameWidth,
    frameHeight,
    playerX,
    playerY,
    playerDirection
  );
}


// ==================================================
// 跳躍動畫
// ==================================================

function playJumpAnimation() {
  let frameWidth =
    jumpSheet.width / 8;

  let frameHeight =
    jumpSheet.height;

  jumpTimer++;

  if (jumpTimer >= jumpSpeed) {
    jumpTimer = 0;
    jumpFrame++;
  }

  // 前 4 張向上
  if (jumpFrame < 4) {
    let progress =
      (jumpFrame + 1) / 4;

    playerY =
      jumpStartY -
      jumpHeight * progress;
  }

  // 後 4 張向下
  else if (jumpFrame < 8) {
    let progress =
      (jumpFrame - 4 + 1) / 4;

    playerY =
      jumpStartY -
      jumpHeight * (1 - progress);
  }

  // 跳躍結束
  if (jumpFrame >= 8) {
    jumpFrame = 0;
    jumpTimer = 0;

    playerY =
      height -
      playerHeight / 2;

    currentAction = "stop";
  }

  let sourceX =
    jumpFrame * frameWidth;

  drawSprite(
    jumpSheet,
    sourceX,
    0,
    frameWidth,
    frameHeight,
    playerX,
    playerY,
    playerDirection
  );
}


// ==================================================
// 攻擊動畫
// ==================================================

function playAttackAnimation() {
  let frameWidth =
    attackSheet.width / 12;

  let frameHeight =
    attackSheet.height;

  attackTimer++;

  if (attackTimer >= attackSpeed) {
    attackTimer = 0;
    attackFrame++;

    // 第 5 張播放完後顯示 picture/0
    if (attackFrame >= 5) {
      showEffect = true;
    }
  }

  // 攻擊完成
  if (attackFrame >= 12) {
    attackFrame = 0;
    attackTimer = 0;

    isAttacking = false;
    showEffect = false;
    currentAction = "stop";
  }

  let sourceX =
    attackFrame * frameWidth;

  drawSprite(
    attackSheet,
    sourceX,
    0,
    frameWidth,
    frameHeight,
    playerX,
    playerY,
    playerDirection
  );
}


// ==================================================
// 繪製角色精靈
// ==================================================

function drawSprite(
  spriteSheet,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  x,
  y,
  direction
) {
  let displayWidth =
    playerHeight *
    sourceWidth /
    sourceHeight;

  push();

  translate(x, y);

  // 向左時左右鏡像
  if (direction === -1) {
    scale(-1, 1);
  }

  image(
    spriteSheet,
    0,
    0,
    displayWidth,
    playerHeight,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight
  );

  pop();
}


// ==================================================
// picture/0 攻擊特效
// ==================================================

function drawAttackEffect() {
  let scaleFactor =
    playerHeight /
    attackSheet.height;

  let displayWidth =
    effectImage.width *
    scaleFactor;

  let displayHeight =
    effectImage.height *
    scaleFactor;

  effectX +=
    effectSpeed *
    scaleFactor *
    playerDirection;

  push();

  translate(effectX, playerY);

  if (playerDirection === -1) {
    scale(-1, 1);
  }

  image(
    effectImage,
    0,
    0,
    displayWidth,
    displayHeight
  );

  pop();
}


// ==================================================
// 閃電動畫
//
// 背景最後向右移動：閃電在左側
// 背景最後向左移動：閃電在右側
// ==================================================

function updateLightning() {
  lightningTimer++;

  if (lightningTimer >= lightningSpeed) {
    lightningTimer = 0;
    lightningSeed++;
  }
}


function drawLightning() {
  let lightningX;

  // 背景最後向右移動
  // 角色向左自由移動
  // 閃電固定在畫面最左側
  if (lastBackgroundDirection === 1) {
    lightningX =
      playerWidth * 1.5;
  }

  // 背景最後向左移動
  // 角色向右自由移動
  // 閃電固定在畫面最右側
  else if (lastBackgroundDirection === -1) {
    lightningX =
      width - playerWidth * 1.5;
  }

  // 尚未有背景移動方向
  else {
    return;
  }

  let lightningY =
    height -
    playerHeight * 1.7;

  let lightningWidth =
    playerWidth * 0.9;

  let lightningHeight =
    playerHeight * 1.5;

  drawLightningShape(
    lightningX,
    lightningY,
    lightningWidth,
    lightningHeight,
    lightningSeed
  );
}


// ==================================================
// 自行繪製閃電
// ==================================================

function drawLightningShape(
  x,
  y,
  lightningWidth,
  lightningHeight,
  seed
) {
  randomSeed(seed);

  push();

  // 閃電本體
  strokeWeight(
    max(3, playerHeight * 0.035)
  );

  stroke(255, 255, 80);

  fill(255, 255, 120);

  beginShape();

  vertex(
    x - lightningWidth * 0.15,
    y - lightningHeight / 2
  );

  vertex(
    x + lightningWidth * 0.20,
    y - lightningHeight * 0.12
  );

  vertex(
    x + lightningWidth * 0.02,
    y - lightningHeight * 0.10
  );

  vertex(
    x + lightningWidth * 0.25,
    y + lightningHeight * 0.45
  );

  vertex(
    x - lightningWidth * 0.10,
    y + lightningHeight * 0.08
  );

  vertex(
    x - lightningWidth * 0.30,
    y + lightningHeight * 0.12
  );

  vertex(
    x - lightningWidth * 0.15,
    y - lightningHeight / 2
  );

  endShape(CLOSE);

  // 閃電外部光暈
  noFill();

  stroke(255, 255, 180, 120);

  strokeWeight(
    max(6, playerHeight * 0.08)
  );

  beginShape();

  vertex(
    x - lightningWidth * 0.15,
    y - lightningHeight * 0.48
  );

  vertex(
    x + lightningWidth * 0.20,
    y - lightningHeight * 0.12
  );

  vertex(
    x + lightningWidth * 0.02,
    y - lightningHeight * 0.10
  );

  vertex(
    x + lightningWidth * 0.25,
    y + lightningHeight * 0.43
  );

  endShape();

  pop();
}


// ==================================================
// 鍵盤控制
// ==================================================

function keyPressed() {
  // 攻擊期間不接受其他按鍵
  if (isAttacking) {
    return false;
  }

  // 按 A 鍵攻擊
  if (key === "a" || key === "A") {
    isAttacking = true;
    currentAction = "attack";

    attackFrame = 0;
    attackTimer = 0;

    // 按下 A 時先隱藏 picture/0
    showEffect = false;

    effectX =
      playerX +
      playerDirection *
      playerWidth;

    showLightning = false;

    return false;
  }

  // 按上方向鍵跳躍
  if (keyCode === UP_ARROW) {
    if (currentAction !== "jump") {
      currentAction = "jump";

      jumpFrame = 0;
      jumpTimer = 0;

      jumpStartY = playerY;

      // 跳躍最高距離為角色高度的 3/2
      jumpHeight =
        playerHeight * 3 / 2;
    }

    showLightning = false;

    return false;
  }

  // 按左方向鍵
  if (keyCode === LEFT_ARROW) {
    playerDirection = -1;
    return false;
  }

  // 按右方向鍵
  if (keyCode === RIGHT_ARROW) {
    playerDirection = 1;
    return false;
  }
}


// ==================================================
// 視窗大小變更
// ==================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  calculateDisplaySize();
  updateBackgroundLimit();

  playerX =
    constrain(
      playerX,
      playerWidth / 2,
      width - playerWidth / 2
    );

  playerY =
    height -
    playerHeight / 2;
}