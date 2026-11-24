let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖[cite: 1]
let walkSprite; // 儲存角色一的走路精靈圖[cite: 1]
let magicSprite; // 儲存角色一的施法精靈圖[cite: 1]
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖[cite: 1]
let char2StopSprite; // 儲存角色二的待機精靈圖 2/stop/stop.png
let char2ActionSprite; // 儲存角色二的動作精靈圖 2/action/action.png

let characterX; // 儲存角色一目前的水平中心位置[cite: 1]
let isWalking = false; // 記錄角色是否已切換為走路動畫[cite: 1]
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）[cite: 1]
let isCasting = false; // 記錄角色是否正在播放施法動畫[cite: 1]
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數[cite: 1]
let magicDirection = 1; // 記錄施法時鎖定的方向[cite: 1]
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發[cite: 1]
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效[cite: 1]

// 英文單字填空選擇題狀態
let wasChar1NearChar2 = false; // 記錄上一幀角色一是否接近角色二
let currentQuiz = null; // 儲存目前的英文單字填空選擇題
let selectedOptionIndex = -1; // 記錄玩家選擇的選項索引（-1 代表尚未作答）
let recentQuestionIndices = []; // 記錄近期出過的題目索引，避免連續重複

const frameCountInSprite = 10; // 設定精靈圖包含的影格數[cite: 1]
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）[cite: 1]
const frameHeight = 196; // 設定每個影格的高度[cite: 1]
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數[cite: 1]
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度[cite: 1]
const walkFrameHeight = 198; // 設定走路動畫每格的高度[cite: 1]
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數[cite: 1]
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度[cite: 1]
const magicFrameHeight = 146; // 設定施法動畫每格的高度[cite: 1]
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數[cite: 1]
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度[cite: 1]
const effectFrameHeight = 19; // 設定魔法特效每格的高度[cite: 1]
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格[cite: 1]

// 角色二精靈圖參數
const char2StopFrameCount = 7; // 2/stop/stop.png 影格數
const char2StopTotalWidth = 618; // 2/stop/stop.png 全寬
const char2StopFrameWidth = char2StopTotalWidth / char2StopFrameCount; // 每格寬度
const char2StopFrameHeight = 190; // 2/stop/stop.png 高度

const char2ActionFrameCount = 12; // 2/action/action.png 影格數
const char2ActionTotalWidth = 2131; // 2/action/action.png 全寬
const char2ActionFrameWidth = char2ActionTotalWidth / char2ActionFrameCount; // 每格寬度
const char2ActionFrameHeight = 177; // 2/action/action.png 高度

// 英文單字填空題庫（含正確單字與三個干擾選項）
const englishQuizBank = [
  {
    sentence: "Please ____ the door before you leave.",
    hint: "提示：關上",
    answer: "close",
    distractors: ["open", "draw", "sing"]
  },
  {
    sentence: "The sun is very ____ in summer.",
    hint: "提示：明亮的／耀眼的",
    answer: "bright",
    distractors: ["quiet", "heavy", "slow"]
  },
  {
    sentence: "I am ____; can I have some water?",
    hint: "提示：口渴的",
    answer: "thirsty",
    distractors: ["angry", "tall", "clean"]
  },
  {
    sentence: "She likes to ____ a book before bed.",
    hint: "提示：閱讀",
    answer: "read",
    distractors: ["jump", "wash", "cook"]
  },
  {
    sentence: "The elephant is a very ____ animal.",
    hint: "提示：巨大的",
    answer: "huge",
    distractors: ["tiny", "soft", "sweet"]
  },
  {
    sentence: "We should ____ our hands before dinner.",
    hint: "提示：清洗",
    answer: "wash",
    distractors: ["ride", "sleep", "build"]
  },
  {
    sentence: "It is ____ today, so take an umbrella.",
    hint: "提示：下雨的",
    answer: "rainy",
    distractors: ["sunny", "windy", "funny"]
  },
  {
    sentence: "Tom can ____ very fast like a rabbit.",
    hint: "提示：奔跑",
    answer: "run",
    distractors: ["cry", "hide", "cut"]
  }
];

function generateEnglishQuiz() {
  const availableIndices = [];
  for (let i = 0; i < englishQuizBank.length; i++) {
    if (!recentQuestionIndices.includes(i)) {
      availableIndices.push(i);
    }
  }

  const pool = availableIndices.length > 0 ? availableIndices : englishQuizBank.map((_, idx) => idx);
  const chosenIdx = random(pool);

  recentQuestionIndices.push(chosenIdx);
  if (recentQuestionIndices.length > 4) {
    recentQuestionIndices.shift();
  }

  const item = englishQuizBank[chosenIdx];
  const options = shuffle([item.answer, ...item.distractors]);

  return {
    sentence: item.sentence,
    hint: item.hint,
    answer: item.answer,
    options: options
  };
}

function getQuizBoxBounds() {
  const boxWidth = width / 3; // 寬為整個畫布寬的 1/3
  const boxHeight = height / 2; // 高為整個畫布高的 1/2
  const boxX = width / 2 - boxWidth / 2; // 方框中間對準畫布中間
  const boxY = 12; // 方框上方靠近畫布上方
  return { x: boxX, y: boxY, w: boxWidth, h: boxHeight };
}

function getFittedTextSize(str, maxWidth, desiredSize, minSize = 11) {
  let size = desiredSize;
  textSize(size);
  const currentW = textWidth(str);
  if (currentW > maxWidth && currentW > 0) {
    size = max(minSize, size * (maxWidth / currentW));
  }
  return size;
}

function preload() { // 在畫布建立前載入圖片資源[cite: 1]
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖[cite: 1]
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖[cite: 1]
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖[cite: 1]
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖[cite: 1]
  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的待機精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的動作精靈圖
} // 結束圖片載入函式[cite: 1]

function setup() { // 初始化畫布與繪圖模式[cite: 1]
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布[cite: 1]
  imageMode(CENTER); // 讓座標代表影格的中心點[cite: 1]
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處[cite: 1]
  frameRate(60); // 將動畫更新速率設定為每秒六十格[cite: 1]
} // 結束初始化函式[cite: 1]

function draw() { // 每個畫面更新一次背景與角色[cite: 1]
  background("#87CEEB"); // 預設底色避免圖片載入前空白[cite: 1]

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置[cite: 1]

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住[cite: 1]
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住[cite: 1]
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫[cite: 1]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度[cite: 1]

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度[cite: 1]
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵[cite: 1]
    isWalking = true; // 切換至走路動畫[cite: 1]
    facingDirection = 1; // 設定角色朝向右方[cite: 1]
    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep; // 讓角色向右移動[cite: 1]
    }
  } else if (movingLeft) { // 按住左方向鍵[cite: 1]
    isWalking = true; // 切換至走路動畫[cite: 1]
    facingDirection = -1; // 設定角色朝向左方[cite: 1]
    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep; // 讓角色向左移動[cite: 1]
    }
  }

  // 限制角色中心避免超出畫布左右邊界[cite: 1]
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左 i=-1、中 i=0、右 i=1）
  if (bgImage) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // 計算角色二位置：最左邊背景圖（i = -1）的水平中心
  const leftBgCenterX = bgOffsetX - singleBgWidth / 2;
  const char2X = leftBgCenterX;

  // 判斷角色一是否接近角色二
  const proximityThreshold = max(180, characterWidth * 1.4);
  const isChar1NearChar2 = abs(characterX - char2X) <= proximityThreshold;

  // 剛接近時產生新英文單字填空題並重設作答狀態
  if (isChar1NearChar2 && !wasChar1NearChar2) {
    currentQuiz = generateEnglishQuiz();
    selectedOptionIndex = -1;
  }
  wasChar1NearChar2 = isChar1NearChar2;

  // 依接近狀態決定角色二精靈圖與影格參數
  const char2Sprite = isChar1NearChar2 ? char2ActionSprite : char2StopSprite;
  const char2FrameCount = isChar1NearChar2 ? char2ActionFrameCount : char2StopFrameCount;
  const char2FrameWidth = isChar1NearChar2 ? char2ActionFrameWidth : char2StopFrameWidth;
  const char2FrameHeight = isChar1NearChar2 ? char2ActionFrameHeight : char2StopFrameHeight;

  if (char2Sprite) {
    const char2Scale = (height / 3) / char2StopFrameHeight;
    const char2FrameIndex = floor(frameCount / framesPerStep) % char2FrameCount;
    const char2SourceX = char2FrameIndex * char2FrameWidth;
    const char2DrawWidth = char2FrameWidth * char2Scale;
    const char2DrawHeight = char2FrameHeight * char2Scale;
    const char2Y = height - char2DrawHeight / 2;

    push();
    translate(char2X, char2Y);
    scale(characterX >= char2X ? 1 : -1, 1);
    image(char2Sprite, 0, 0, char2DrawWidth, char2DrawHeight, char2SourceX, 0, char2FrameWidth, char2FrameHeight);
    pop();
  }

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次[cite: 1]
    isCasting = false; // 結束施法動畫並恢復一般角色動作[cite: 1]
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效[cite: 1]
  } // 結束施法動畫完成判斷[cite: 1]

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖[cite: 1]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數[cite: 1]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度[cite: 1]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度[cite: 1]
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數[cite: 1]
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格[cite: 1]
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點[cite: 1]
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度[cite: 1]
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度[cite: 1]
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部[cite: 1]

  push(); // 暫存目前的繪圖座標轉換狀態[cite: 1]
  translate(characterX, characterY); // 將繪圖原點移至角色中心[cite: 1]
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉[cite: 1]
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格[cite: 1]
  pop(); // 還原繪圖座標轉換狀態[cite: 1]

  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布[cite: 1]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度[cite: 1]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度[cite: 1]
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度[cite: 1]
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效[cite: 1]
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料[cite: 1]
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置[cite: 1]
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣[cite: 1]
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效[cite: 1]
      continue; // 略過已移除特效的繪製[cite: 1]
    } // 結束特效邊界判斷[cite: 1]
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格[cite: 1]
    push(); // 暫存目前的繪圖座標轉換狀態[cite: 1]
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心[cite: 1]
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格[cite: 1]
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格[cite: 1]
    pop(); // 還原繪圖座標轉換狀態[cite: 1]
  } // 結束飛行中特效更新迴圈[cite: 1]

  // 當角色1接近角色2時，繪製上方黃色半透明英文單字填空四選一方框
  if (isChar1NearChar2 && currentQuiz) {
    drawEnglishQuizBox();
  }
} // 結束繪圖函式[cite: 1]

function drawEnglishQuizBox() {
  const { x: boxX, y: boxY, w: boxWidth, h: boxHeight } = getQuizBoxBounds();
  const centerX = boxX + boxWidth / 2;
  const innerPadding = max(14, boxWidth * 0.06);
  const maxInnerTextWidth = max(60, boxWidth - innerPadding * 2);

  const displaySentence =
    selectedOptionIndex !== -1
      ? currentQuiz.sentence.replace("____", currentQuiz.options[selectedOptionIndex])
      : currentQuiz.sentence;

  push();
  rectMode(CORNER);
  // 黃色方框，透明度為 90
  fill(255, 235, 59, 90);
  stroke(210, 175, 0, 200);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 14);

  // 標題
  noStroke();
  fill(30);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(getFittedTextSize("英文單字填空", maxInnerTextWidth, constrain(boxHeight * 0.065, 13, 20)));
  text("英文單字填空", centerX, boxY + boxHeight * 0.04);

  // 中文提示
  textStyle(NORMAL);
  fill(55);
  textSize(getFittedTextSize(currentQuiz.hint, maxInnerTextWidth, constrain(boxHeight * 0.052, 11, 16)));
  text(currentQuiz.hint, centerX, boxY + boxHeight * 0.115);

  // 題目填空句（嚴格置中於方框內並依寬度自適應字級）
  fill(25);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  const sentenceCenterY = boxY + boxHeight * 0.245;
  textSize(getFittedTextSize(displaySentence, maxInnerTextWidth, constrain(boxHeight * 0.068, 13, 21)));
  text(displaySentence, centerX, sentenceCenterY);

  // 繪製 4 個選擇題選項按鈕
  const optionLabels = ["1", "2", "3", "4"];
  const optionStartY = boxY + boxHeight * 0.34;
  const optionGap = boxHeight * 0.125;
  const optionBtnW = min(maxInnerTextWidth, boxWidth * 0.76);
  const optionBtnH = boxHeight * 0.095;

  for (let i = 0; i < currentQuiz.options.length; i++) {
    const optWord = currentQuiz.options[i];
    const btnX = centerX - optionBtnW / 2;
    const btnY = optionStartY + i * optionGap;

    if (selectedOptionIndex === i) {
      if (optWord === currentQuiz.answer) {
        fill(76, 175, 80, 210); // 答對綠色
      } else {
        fill(244, 67, 54, 210); // 答錯紅色
      }
    } else {
      fill(255, 255, 255, 185);
    }

    stroke(80, 80, 80, 150);
    strokeWeight(1.5);
    rect(btnX, btnY, optionBtnW, optionBtnH, 8);

    noStroke();
    fill(selectedOptionIndex === i ? 255 : 25);
    textAlign(CENTER, CENTER);
    const labelText = `(${optionLabels[i]})  ${optWord}`;
    textSize(getFittedTextSize(labelText, optionBtnW - 12, constrain(optionBtnH * 0.55, 12, 20)));
    text(labelText, centerX, btnY + optionBtnH / 2);
  }

  // 顯示作答結果或操作提示
  textAlign(CENTER, BOTTOM);
  let statusText = "請按數字鍵 1~4 或點擊選項作答";
  if (selectedOptionIndex !== -1) {
    const chosen = currentQuiz.options[selectedOptionIndex];
    if (chosen === currentQuiz.answer) {
      fill(20, 110, 30);
      statusText = "答對了！單字正確！";
    } else {
      fill(180, 20, 20);
      statusText = `答錯了，正確單字是 ${currentQuiz.answer}`;
    }
  } else {
    fill(50);
  }
  textSize(getFittedTextSize(statusText, maxInnerTextWidth, constrain(boxHeight * 0.058, 11, 17)));
  text(statusText, centerX, boxY + boxHeight - 10);
  pop();
}

function mousePressed() {
  if (!wasChar1NearChar2 || !currentQuiz) return;

  const { x: boxX, y: boxY, w: boxWidth, h: boxHeight } = getQuizBoxBounds();
  const centerX = boxX + boxWidth / 2;
  const innerPadding = max(14, boxWidth * 0.06);
  const maxInnerTextWidth = max(60, boxWidth - innerPadding * 2);
  const optionStartY = boxY + boxHeight * 0.34;
  const optionGap = boxHeight * 0.125;
  const optionBtnW = min(maxInnerTextWidth, boxWidth * 0.76);
  const optionBtnH = boxHeight * 0.095;

  for (let i = 0; i < currentQuiz.options.length; i++) {
    const btnX = centerX - optionBtnW / 2;
    const btnY = optionStartY + i * optionGap;
    if (mouseX >= btnX && mouseX <= btnX + optionBtnW && mouseY >= btnY && mouseY <= btnY + optionBtnH) {
      selectedOptionIndex = i;
      break;
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向[cite: 1]
  // 當題目方框顯示時，支援按數字鍵 1~4 作答
  if (wasChar1NearChar2 && currentQuiz) {
    if (key === "1" || key === "2" || key === "3" || key === "4") {
      selectedOptionIndex = int(key) - 1;
      return false;
    }
  }

  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵[cite: 1]
    isWalking = true; // 啟用走路動畫[cite: 1]
    facingDirection = 1; // 讓角色面向右方[cite: 1]
    return false; // 防止方向鍵捲動網頁[cite: 1]
  } // 結束右方向鍵判斷[cite: 1]
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵[cite: 1]
    isWalking = true; // 啟用走路動畫[cite: 1]
    facingDirection = -1; // 讓角色面向左方[cite: 1]
    return false; // 防止方向鍵捲動網頁[cite: 1]
  } // 結束左方向鍵判斷[cite: 1]
  if (keyCode === 32) { // 判斷是否按下空白鍵[cite: 1]
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發[cite: 1]
      isCasting = true; // 開始播放施法動畫[cite: 1]
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面[cite: 1]
      magicDirection = facingDirection; // 鎖定施法當下角色面向[cite: 1]
    } // 結束施法啟動判斷[cite: 1]
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發[cite: 1]
    return false; // 防止空白鍵捲動網頁[cite: 1]
  } // 結束空白鍵判斷[cite: 1]
} // 結束按鍵事件處理函式[cite: 1]

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態[cite: 1]
  if (keyCode === 32) { // 判斷放開的是否為空白鍵[cite: 1]
    spaceIsDown = false; // 允許下次按空白鍵重新施法[cite: 1]
  } // 結束空白鍵放開判斷[cite: 1]
} // 結束按鍵放開事件處理函式[cite: 1]

function windowResized() { // 視窗尺寸改變時重新調整畫布[cite: 1]
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸[cite: 1]
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內[cite: 1]
} // 結束視窗縮放處理函式[cite: 1]