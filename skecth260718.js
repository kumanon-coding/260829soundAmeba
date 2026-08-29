//============
//背景画像
//============
let bgPC;
let bgSP;
let bgImg;

function preload() {
  //PC背景
  bgPC = loadImage("/img/pc_bg.jpg");
  //SP背景
  bgSP = loadImage("/img/sp_bg.jpg");
}
//====================
// 星エフェクト
//====================
let effects = []; //エフェクトを保存する配列

let STAR_COUNT = 50; //星の数

//============
//音楽関連
//============

let song;
let amplitude;

//アメーバの状態
let t = 0; // ノイズアニメーション用

let baseRadius = 200; //アメーバのサイズ

function setup() {
  createCanvas(windowWidth, windowHeight); //カンバスサイズ

  amplitude = new p5.Amplitude();//音量解析

  //最初の背景選択
  selectBackground();

  //音楽選択
  let select = document.getElementById("musicSelect");

  select.addEventListener("change", changeMusic);//つぎはここから8/15

}

function draw() {
  //背景画像の描画
  drawBackground();

  let volume = 0;

  if (song) {
    volume = amplitude.getLevel();
  }
  //中心位置をふわふわ動かす
  let centerX = width/2 + sin(frameCount * 0.01) * 20

  let centerY = height / 2 + cos(frameCount * 0.008) * 20

  let distrtion = map(
    volume,
    0,
    0.3,
    10,
    120
  );

  push();

  translate(centerX, centerY);

  noFill();

  stroke(255, 200, 255, 255);

  strokeWeight(20);

  beginShape(); //アメーバ描画開始

  //円を作るように頂点を並べる
  for (let angle = 0; angle < TWO_PI; angle += 0.1){
    //ノイズで半径を変形
    let r = baseRadius + noise(cos(angle) + t, sin(angle) + t) * distrtion;

    let x = cos(angle) * r;
    let y = sin(angle) * r;

    vertex(x, y);
  }
  endShape(CLOSE);

  pop();

  t += 0.01; //ノイズ時間進行

  //====================
  // 星エフェクト
  //====================
  for (let i = effects.length - 1; i >= 0; i--){

    effects[i].update();

    effects[i].show();

    if (effects[i].isFinished()) {
      effects.splice(i,1);
    }
  }
}
function changeMusic(event) {
  if (song) {
    song.stop();
  }

  let path = event.target.value;

  if (path == "") return;

  loadSound(
    path,
    function (sound) {
        song = sound;
        song.play();
        amplitude.setInput(song);
      }
  );
}


function selectBackground() {
  //背景を選択する処理
  if (windowWidth >= 768) {
    bgImg = bgPC;
  } else {
    bgImg = bgSP;
  }
}

function drawBackground() {
  //背景を描画する処理
  let canvasRatio = width / height;

  let imgRatio = bgImg.width / bgImg.height;

  let sx, sy, sw, sh;

  if (imgRatio > canvasRatio) {

    sh = bgImg.height;

    sw = sh * canvasRatio;

    sx = (bgImg.width - sw) / 2;

    sy = 0;

  }else{

    sw = bgImg.width;

    sh = sw / canvasRatio;

    sx = 0;

    sy = (bgImg.height - sh) / 2;

  }

  image(bgImg, 0, 0, width, height, sx, sy, sw, sh);
}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  selectBackground();

}

//クリックした時
function mousePressed() {
  effects.push(
    new StarEffect(mouseX, mouseY, STAR_COUNT)
  );
}

//タップした時
function touchStarted() {
  effects.push(
    new StarEffect(mouseX, mouseY, STAR_COUNT)
  );

  //return false;
}

//星のエフェクト
class StarEffect{

  constructor(x,y,count) {

    this.stars = [];

    for (let i = 0; i < count; i++){

      let angle = random(TWO_PI);

      let speed = random(2, 8);

      this.stars.push({
        x: x,
        y: y,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        size: random(8, 20),
        alpha: 255,
        rotate: random(TWO_PI),
        rotateSpeed: random(-0.15, 0.15),
        color: color(random(80,255),random(80,255),random(80,255),)
      });
    }
  }
  update() {
    for (let s of this.stars){
      s.x += s.vx;

      s.y += s.vy;

      s.vy += 0.08;

      s.alpha -= 5;

      s.rotate += s.rotateSpeed;
    }
  }

  show() {
    noStroke();

    fill(255, 230, 80);

    for (let s of this.stars){
      push();

      translate(s.x, s.y);

      rotate(s.rotate);

      tint(255, s.alpha);

      fill(red(s.color), green(s.color), blue(s.color), s.alpha);

      drawStar(0, 0, s.size * 0.4, s.size, 5);

      pop();
    }
  }

  isFinished() {
    return this.stars[0].alpha <= 0;
  }
}

//星を描く関数
function drawStar(x, y, r1, r2, n) {

  beginShape();

  for (let i = 0; i < n * 2; i++){

    let angle = PI * i / n;
    let r = (i % 2 == 0) ? r2 : r1;

    vertex(
      x + cos(angle) * r,
      y + sin(angle) * r
    );
  }

  endShape(CLOSE);
}
