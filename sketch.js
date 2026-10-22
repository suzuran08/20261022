// 測驗資料：台灣交通規則與常識
const quizData = [
  { id: 1, title: "讓路線標線", correctText: "倒三角形白色標線" },
  { id: 2, title: "行經平交道", correctText: "停、看、聽，確認無車" },
  { id: 3, title: "行人穿越道", correctText: "暫停讓行人先行通過" },
  { id: 4, title: "酒駕違規標準", correctText: "吐氣酒精濃度達0.15mg/L" },
  { id: 5, title: "高速公路內側", correctText: "為超車道，不得佔用" },
  { id: 6, title: "闖紅燈罰款", correctText: "機車1800/汽車2700起" }
];

let targets = []; // 上方的固定目標區塊
let draggables = []; // 下方的可拖曳選項
let draggedItem = null; // 目前被拖曳的物件
let submitBtn;
let isSubmitted = false;
let score = 0;
let particles = []; // 煙火粒子系統

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initGame();
}

function initGame() {
  targets = [];
  draggables = [];
  isSubmitted = false;
  score = 0;
  particles = [];
  
  // --- 1. 計算排版尺寸與間距 ---
  // 統一上方與下方的寬度，畫面更整齊
  let itemWidth = min(width / 3.5, 230); 
  let targetHeight = 70;
  let dragHeight = 55;
  
  let gapX = 20; // 水平間距
  // 垂直間距：確保第一排加上已放入的答案 (70+15+55) 不會疊到第二排
  let targetGapY = max(height * 0.22, 160); 
  
  let totalWidth = (itemWidth * 3) + (gapX * 2);
  let startX = (width - totalWidth) / 2;
  let startY = max(height * 0.1, 70); // 上方區塊起始高度

  // --- 2. 初始化上方目標區塊 (2x3 排列) ---
  for (let i = 0; i < 6; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    
    targets.push({
      x: startX + col * (itemWidth + gapX),
      y: startY + row * targetGapY,
      w: itemWidth,
      h: targetHeight,
      data: quizData[i],
      slottedItem: null
    });
  }

  // --- 3. 初始化下方可拖曳文字選項 (2x3 排列) ---
  let shuffledData = [...quizData].sort(() => Math.random() - 0.5);
  
  // 確保下方選項起始位置，一定在「上方第二排目標 + 第二排放入的答案」之下
  let dragStartY = max(height * 0.6, startY + targetGapY + 160);
  let dragGapY = 20;
  
  for (let i = 0; i < 6; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    
    let x = startX + col * (itemWidth + gapX);
    let y = dragStartY + row * (dragHeight + dragGapY);

    draggables.push({
      x: x,
      y: y,
      w: itemWidth,
      h: dragHeight,
      originalX: x,
      originalY: y,
      data: shuffledData[i],
      isDragging: false,
      isSlotted: false
    });
  }

  // --- 4. 動態計算交卷按鈕位置 ---
  // 讓按鈕永遠在下方選項塊的底部再往下 30px
  let draggablesBottom = dragStartY + (dragHeight + dragGapY) * 2;
  submitBtn = {
    x: width / 2 - 75,
    y: min(height - 70, draggablesBottom + 30), // 避免超過視窗，但保持在下方
    w: 150,
    h: 50,
    label: "交卷看成績"
  };
}

function draw() {
  background(240, 245, 250);

  // 標題
  fill(50);
  textSize(32);
  text("交通部駕照測驗 - 道路行車規定拖曳題", width / 2, 40);

  // 繪製目標區塊 (呼吸動畫)
  for (let i = 0; i < targets.length; i++) {
    let t = targets[i];
    
    let bounce = sin(frameCount * 0.1 + i) * 3;
    let colorPulse = map(sin(frameCount * 0.05 + i), -1, 1, 180, 230);
    
    fill(colorPulse, 210, 255);
    stroke(100, 150, 255);
    strokeWeight(3);
    rect(t.x, t.y + bounce, t.w, t.h, 12);
    
    noStroke();
    fill(30);
    textSize(18);
    text(t.data.title, t.x + t.w / 2, t.y + t.h / 2 + bounce);
  }

  // 判斷是否全部都已放置
  let allSlotted = draggables.every(d => d.isSlotted);

  // 繪製交卷按鈕
  if (allSlotted && !isSubmitted) {
    fill(46, 204, 113);
    rect(submitBtn.x, submitBtn.y, submitBtn.w, submitBtn.h, 25);
    fill(255);
    textSize(20);
    text(submitBtn.label, submitBtn.x + submitBtn.w / 2, submitBtn.y + submitBtn.h / 2);
  }

  // 繪製可拖曳的選項
  for (let i = 0; i < draggables.length; i++) {
    let d = draggables[i];
    
    if (d.isDragging) {
      d.x = mouseX - d.w / 2;
      d.y = mouseY - d.h / 2;
    }

    fill(255);
    stroke(200);
    strokeWeight(2);
    
    if (isSubmitted) {
      if (d.isSlotted) {
        let target = targets.find(t => t.slottedItem === d);
        if (target && target.data.id === d.data.id) fill(200, 255, 200); 
        else fill(255, 200, 200); 
      }
    }
    
    // 拖曳時稍微放大
    if (d.isDragging) {
      rect(d.x - 5, d.y - 5, d.w + 10, d.h + 10, 10);
    } else {
      rect(d.x, d.y, d.w, d.h, 10);
    }
    
    noStroke();
    fill(50);
    textSize(15); 
    text(d.data.correctText, d.x + d.w / 2, d.y + d.h / 2);
  }

  // 顯示成績與煙火
  if (isSubmitted) {
    fill(0, 150, 255);
    textSize(40);
    text(`成績：${score} / 100`, width / 2, height / 2);
    
    if (score >= 86) {
      handleFireworks();
    }
  }
}

// 語音發音函式
function speakText(txt) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // 停止先前的語音
    
    let msg = new SpeechSynthesisUtterance(txt);
    msg.lang = 'zh-TW'; 
    msg.rate = 1.0; 
    msg.pitch = 1.0; 
    
    window.speechSynthesis.speak(msg);
  }
}

function mousePressed() {
  if (isSubmitted) return;

  // 檢查是否點擊了交卷按鈕
  let allSlotted = draggables.every(d => d.isSlotted);
  if (allSlotted && submitBtn && 
      mouseX > submitBtn.x && mouseX < submitBtn.x + submitBtn.w &&
      mouseY > submitBtn.y && mouseY < submitBtn.y + submitBtn.h) {
    calculateScore();
    return;
  }

  // 檢查是否點擊了可拖曳物件
  for (let i = draggables.length - 1; i >= 0; i--) {
    let d = draggables[i];
    if (mouseX > d.x && mouseX < d.x + d.w && mouseY > d.y && mouseY < d.y + d.h) {
      d.isDragging = true;
      draggedItem = d;
      
      // 觸發語音朗讀選項內容
      speakText(d.data.correctText);
      
      if (d.isSlotted) {
        let t = targets.find(t => t.slottedItem === d);
        if (t) t.slottedItem = null;
        d.isSlotted = false;
      }
      break; 
    }
  }
}

function mouseReleased() {
  if (draggedItem) {
    draggedItem.isDragging = false;
    let placed = false;

    for (let i = 0; i < targets.length; i++) {
      let t = targets[i];
      let cx = draggedItem.x + draggedItem.w / 2;
      let cy = draggedItem.y + draggedItem.h / 2;
      
      if (cx > t.x && cx < t.x + t.w && cy > t.y && cy < t.y + t.h) {
        if (t.slottedItem) {
          t.slottedItem.x = t.slottedItem.originalX;
          t.slottedItem.y = t.slottedItem.originalY;
          t.slottedItem.isSlotted = false;
        }
        
        // 將選項吸附於目標正下方 (間距 15px)
        draggedItem.x = t.x + (t.w - draggedItem.w) / 2;
        draggedItem.y = t.y + t.h + 15;
        draggedItem.isSlotted = true;
        t.slottedItem = draggedItem;
        placed = true;
        break;
      }
    }

    if (!placed) {
      draggedItem.x = draggedItem.originalX;
      draggedItem.y = draggedItem.originalY;
      draggedItem.isSlotted = false;
    }
    
    draggedItem = null;
  }
}

function calculateScore() {
  isSubmitted = true;
  let correctCount = 0;
  
  for (let i = 0; i < targets.length; i++) {
    if (targets[i].slottedItem && targets[i].slottedItem.data.id === targets[i].data.id) {
      correctCount++;
    }
  }
  
  score = round((correctCount / 6) * 100);
  
  if (score >= 86) {
    for (let i = 0; i < 200; i++) {
      particles.push(new Particle(random(width), random(height)));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!isSubmitted) {
    initGame(); // 縮放時重新排版
  }
}

// 煙火與彩帶粒子系統
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-6, 6);
    this.vy = random(-8, 2);
    this.life = 255;
    this.r = random(150, 255);
    this.g = random(50, 200);
    this.b = random(100, 250);
    this.size = random(6, 12);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; 
    this.life -= 2;
  }
  show() {
    noStroke();
    fill(this.r, this.g, this.b, this.life);
    if (this.size > 9) {
      rect(this.x, this.y, this.size, this.size / 2);
    } else {
      circle(this.x, this.y, this.size);
    }
  }
}

function handleFireworks() {
  if (frameCount % 8 === 0) {
    let px = random(width * 0.2, width * 0.8);
    let py = random(height * 0.1, height * 0.4);
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(px, py));
    }
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}