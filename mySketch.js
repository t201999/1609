let currentScene = 'START'; 
let currentQuestion = 0;
let scores = { A: 0, B: 0, C: 0, D: 0 };
let finalResultKey = ""; 

let chains = [];
const cols = 32; 
const beadsPerChain = 60; 
let spacingX, spacingY;
let quizImages = []; 
let resultImages = {}; 
let randomizedOptions = []; 

const gravity = 0.3;   
const damping = 0.91;  

const questions = [
  { text: "1. 你最喜歡的附中早餐？", options: [{t:"培薯抓",k:"A"}, {t:"薯餅塔",k:"B"}, {t:"三明治",k:"C"}, {t:"仙人掌",k:"D"}] },
  { text: "2. 你最喜歡的附中生物？", options: [{t:"喜鵲",k:"A"}, {t:"大笨鳥",k:"B"}, {t:"白鼻心",k:"C"}, {t:"吉他",k:"D"}] },
  { text: "3. 你最喜歡的附中小角落？", options: [{t:"操場",k:"A"}, {t:"圖書館",k:"B"}, {t:"舊北樓",k:"C"}, {t:"地塹",k:"D"}] },
  { text: "4. 你最喜歡的放學美食？", options: [{t:"范姜",k:"A"}, {t:"好食",k:"B"}, {t:"越南河粉",k:"C"}, {t:"富秝",k:"D"}] },
  { text: "5. 你認為陸禹垜是什麼樣的人？", options: [{t:"紅色的人",k:"A"}, {t:"勇敢的人",k:"B"}, {t:"那個石家莊人",k:"C"}, {t:"擱淺的人",k:"D"}] },
  { text: "6. 你認為陸禹垜的性別是？", options: [{t:"男",k:"A"}, {t:"女",k:"B"}, {t:"美味蟹堡",k:"C"}, {t:"以上皆非",k:"D"}] }
];

function preload() {
  // --- 測驗背景圖（請確保圖片副檔名是 .jpg 且都在 assets 資料夾內） ---
  quizImages[0] = loadImage('assets/S__5406732_0.jpg');
  quizImages[1] = loadImage('assets/S__5406729_0.jpg');
  quizImages[2] = loadImage('assets/S__5406727_0.jpg');
  quizImages[3] = loadImage('assets/S__5406728_0.jpg');
  quizImages[4] = loadImage('assets/S__5406731_0.jpg');
  quizImages[5] = loadImage('assets/S__5406730_0.jpg');

  // --- 結果背景圖 ---
  resultImages['大吉'] = loadImage('assets/S__5406735_0.jpg');
  resultImages['吉'] = loadImage('assets/S__5406734_0.jpg');
  resultImages['中吉'] = loadImage('assets/S__5406737_0.jpg');
  resultImages['末吉'] = loadImage('assets/S__5406744.jpg');
  resultImages['天選之人'] = loadImage('assets/S__5406741.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  spacingX = width / (cols + 1);
  spacingY = height / beadsPerChain; 
  initCurtain();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  shuffleCurrentOptions();
}

function shuffleCurrentOptions() {
  randomizedOptions = [...questions[currentQuestion].options];
  for (let i = randomizedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedOptions[i], randomizedOptions[j]] = [randomizedOptions[j], randomizedOptions[i]];
  }
}

function initCurtain() {
  chains = [];
  let pg = createGraphics(width, height);
  pg.background(0); pg.fill(255); pg.textFont('serif'); pg.textStyle(BOLD); pg.textAlign(CENTER, CENTER);
  pg.textSize(width * 0.35); 
  pg.push(); pg.scale(1.6, 0.85); 
  let startY = (spacingY * 8) / 0.85; 
  let gap = (spacingY * 12.5) / 0.85; 
  let centerX = (width / 2) / 1.6;
  pg.text("陸", centerX, startY); pg.text("禹", centerX, startY + gap); pg.text("垛", centerX, startY + gap * 2);
  pg.pop();
  pg.loadPixels();
  for (let i = 0; i < cols; i++) {
    let x = (i + 1) * spacingX;
    let nodes = [];
    for (let j = 0; j < beadsPerChain; j++) {
      let y = j * spacingY;
      let px = pg.get(x, y);
      nodes.push({ pos: createVector(x, y), prev: createVector(x, y), isText: red(px) > 150, pinned: (j === 0) });
    }
    chains.push(nodes);
  }
}

function draw() {
  if (currentScene === 'START') {
    drawGradientBackground(); 
    drawCurtain();
    drawExhibitionText(); 
  } else if (currentScene === 'QUIZ') {
    drawQuiz();
  } else if (currentScene === 'RESULT') {
    drawResult();
  }
}

function drawGradientBackground() {
  let c1 = color(150, 20, 30); let c2 = color(255, 182, 193); 
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    stroke(lerpColor(c1, c2, inter)); line(0, y, width, y);
  }
}

function drawExhibitionText() {
  push();
  fill(255, 230);
  noStroke();
  textFont('serif');
  textSize(width * 0.05);
  textAlign(CENTER, TOP);

  let leftTxt = "師大附中一六〇九畢業展";
  let lx = width * 0.1;
  let ly = height * 0.1;
  for (let i = 0; i < leftTxt.length; i++) {
    text(leftTxt[i], lx, ly + i * (width * 0.06));
  }

  let rightTxt = "三/二三-四/七";
  let rx = width * 0.9;
  let ry = height * 0.65;
  for (let i = 0; i < rightTxt.length; i++) {
    text(rightTxt[i], rx, ry + i * (width * 0.06));
  }
  pop();
}

function drawCurtain() {
  for (let nodes of chains) {
    for (let j = 1; j < nodes.length; j++) {
      let n = nodes[j];
      let vel = p5.Vector.sub(n.pos, n.prev).mult(damping);
      n.prev = n.pos.copy(); n.pos.add(vel); n.pos.y += gravity;
      let d = dist(mouseX, mouseY, n.pos.x, n.pos.y);
      if (d < 85 && (mouseIsPressed || (touches.length > 0))) {
        n.pos.add(p5.Vector.sub(n.pos, createVector(mouseX, mouseY)).normalize().mult(12)); 
      }
    }
    for (let step = 0; step < 2; step++) {
      for (let j = 1; j < nodes.length; j++) {
        let n1 = nodes[j-1]; let n2 = nodes[j];
        let d = p5.Vector.dist(n1.pos, n2.pos);
        let err = (spacingY - d) * 0.5;
        let dir = p5.Vector.sub(n2.pos, n1.pos).normalize().mult(err);
        if (!n1.pinned) n1.pos.sub(dir);
        n2.pos.add(dir);
      }
    }
    stroke(255, 15); noFill(); beginShape();
    for(let n of nodes) vertex(n.pos.x, n.pos.y);
    endShape();
    for (let n of nodes) {
      if (n.isText) {
        push(); drawingContext.shadowBlur = 18; drawingContext.shadowColor = color(255);
        fill(255); noStroke(); ellipse(n.pos.x, n.pos.y, 10, 10); pop();
      } else {
        fill(0, 0, 0, 45); noStroke(); ellipse(n.pos.x, n.pos.y, 10, 10);
      }
    }
  }
  fill(255); noStroke(); textSize(width * 0.045); text("撥開珠簾 點擊開始", width/2, height * 0.92);
}

function drawQuiz() {
  if (quizImages[currentQuestion]) image(quizImages[currentQuestion], 0, 0, width, height);
  let q = questions[currentQuestion];
  push();
  fill(255); drawingContext.shadowBlur = 5; drawingContext.shadowColor = color(0);
  textSize(width * 0.048); 
  text(q.text, width/2, height * 0.45, width * 0.85); 
  pop();

  let btnW = width * 0.65;
  let btnH = height * 0.06;
  let heartGreen = color(0, 100, 80); 

  for (let i = 0; i < randomizedOptions.length; i++) {
    let py = height * 0.62 + i * height * 0.08; 
    stroke(255, 50); strokeWeight(1); fill(heartGreen); 
    rect(width/2, py, btnW, btnH, 15);
    noStroke(); fill(255); textSize(width * 0.038);
    text(randomizedOptions[i].t, width/2, py);
  }
}

function drawResult() {
  if (resultImages[finalResultKey]) {
    image(resultImages[finalResultKey], 0, 0, width, height);
  } else {
    background(0);
  }
  
  fill(0, 100); noStroke();
  rect(width/2, height * 0.82, width * 0.5, height * 0.05, 10);
  fill(255, 220); textSize(width * 0.04);
  text("點擊畫面 重新開始", width/2, height * 0.82);
}

function handleInteraction() {
  if (currentScene === 'START') {
    if (mouseY > height * 0.7) {
      currentScene = 'QUIZ';
      shuffleCurrentOptions();
    }
  } else if (currentScene === 'QUIZ') {
    let btnH = height * 0.06;
    for (let i = 0; i < randomizedOptions.length; i++) {
      let py = height * 0.62 + i * height * 0.08;
      if (mouseY > py - btnH/2 && mouseY < py + btnH/2) {
        scores[randomizedOptions[i].k]++;
        if (currentQuestion < questions.length - 1) {
          currentQuestion++; shuffleCurrentOptions(); 
        } else {
          calculateResult(); currentScene = 'RESULT';
        }
        break;
      }
    }
  } else if (currentScene === 'RESULT') {
    resetAll();
  }
}

function mousePressed() {
  handleInteraction();
}

function touchStarted() {
  handleInteraction();
  return false; // 防止手機畫面滑動
}

function calculateResult() {
  let maxK = 'A'; 
  let maxV = scores.A;
  for (let k in scores) { 
    if (scores[k] > maxV) { 
      maxV = scores[k]; 
      maxK = k; 
    } 
  }
  if (maxV >= 5) {
    finalResultKey = "天選之人";
  } else {
    const mapping = { 'A': '大吉', 'B': '吉', 'C': '中吉', 'D': '末吉' };
    finalResultKey = mapping[maxK];
  }
}

function resetAll() {
  currentScene = 'START'; currentQuestion = 0; scores = { A: 0, B: 0, C: 0, D: 0 };
  initCurtain(); shuffleCurrentOptions();
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
  initCurtain(); 
}