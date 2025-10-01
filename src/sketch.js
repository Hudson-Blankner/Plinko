// ==== ____ ====
const canvW = 850;
const canvH = 700;
const pegsEven = [];
const pegsOdd = [];
let pegs = [];
let score = 0
// ==== Ball Variables + lists ====
let discs = []
// ==== End Ball Variables + lists ====

// ==== Box Variables + lists ====
let baseRamp = [0,10,20,30,40];
let boxValues = [];
const boxes = [];
let boxX = 0;
let boxH = 75;
let boxY = canvH - boxH;
// ==== End Box Variables + lists ====
// ==== Button Code ====
let specialButton;
let specialsMade = false;  //button for making special pegs
let specialsClearBttn;
let specialClear = false;  //button for clearing special pegs
// ==== End Button Code ====
// ==== Peg Code ====
class Peg {
  constructor(x, y, d, type){
    this.x = x; this.y = y; this.d = d
    this.isVolatile = false; this.volatility = 1.0; 
    this.isDupe = false; this.dupeStr = 1.0;
    this.type = type //debug
  }
  draw(){
    noStroke(); 
    if (this.isVolatile) {
      fill("red")
    }else if (this.isDupe){
      fill("blue")
    }else{
    fill(80); 
    }
    circle(this.x,this.y,this.d)
  }
}
function drawOddFunc(x,y,d,type){ //Odd peg drawing function
  for(let row = 0; row < 2; row++){
    for(let col = 0; col < 7; col++){
      pegsOdd.push(new Peg(x + col*100, y + row*200, d, 'odd'));
    }
  }
} //Odd peg drawing function
function drawEvenFunc(x,y,d){  //Even peg drawing funciton
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      pegsEven.push(new Peg(x + col * 100, y + row * 200, d));
    }
  } 
} //Even Peg drawing function
function makeVolatilePegs(){
  const totalCount = pegsEven.length + pegsOdd.length
  const howMany = floor(random(2,5)) //random number from 2-4
  const chosenIndices = new Set(); //makes an invisible array that has no values
  
  while(chosenIndices.size < howMany){     //while true, loop the following:
    const idx = floor(random(totalCount));
    chosenIndices.add(idx) 
  }
  //apply the actial status
  for(const idx of chosenIndices){
    if(idx<pegsEven.length){
      pegsEven[idx].isVolatile =true;
      pegsEven[idx].volatility = 1.5;
    } else {
      const oddIdx = idx - pegsEven.length;
      pegsOdd[oddIdx].isVolatile = true;
      pegsOdd[oddIdx].volatility = 1.5
    }
  }
} // function for making Volatile pegs
function clearSpecialPegs(){
  for (const p of pegsEven) {p.isVolatile = false; p.volatility = 1.0}
  for (const p of pegsOdd) {p.isVolatile = false; p.volatility = 1.0}
  for (const p of pegs) {p.isDupe = false; p.dupeStr = 0}
} //funciton for clearing Voaltile pegs
function makeDupePegs(){
  const totalCount = pegs.length;
  const howMany = floor(random(0,3));
  const chosenAmount = new Set();
  
  while(chosenAmount.size < howMany){
    const amount = floor(random(totalCount));
    chosenAmount.add(amount);
  }
  //apply status
  for(const amount of chosenAmount){
    pegs[amount].isDupe = true;
    pegs[amount].dupeStr = 2;
  }
}
// ==== End Peg Code ====
// ==== Box Code ====
class Box{
  constructor(x,y,w,h,value){
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.value = value
  }
  draw(){
    fill(80); stroke(0); strokeWeight(1);
    rect(this.x, this.y, this.w, this.h)
    noStroke(); fill(30); textAlign(CENTER, CENTER); textSize(16);
    text(this.value, this.x + this.w/2, this.y + this.h/2)
  }
  containsDisc(discs){
    const r = discs.d * 0.25
    return(
      discs.x > this.x + r &&
      discs.x < this.x + this.w - r &&
      discs.y > this.y + r &&
      discs.y < this.y + this.h + r
    );
  }
  scoreIfHit(discs){
    if (!discs.scored && this.containsDisc(discs)){
      score += this.value
      discs.scored = true;
      discs.yv = 0; discs.xv = 0;
      discs.y = this.y + this.h - discs.r - 2;
      return true;
    }
    return false;
  }
}
function buildSymmetric(valuesUp){
  const n = valuesUp.length;
  const left = valuesUp.slice(0, n -1); //duplicate list but excludes last item
  const right = left.slice().reverse(); //duplicates "left" list but reverses it
  return [...left,valuesUp[n-1],...right] //combines left list, last value in original list, and right list ex: [0,10,20,30, 40, 30,20,10,0]
} //creates a symmetrical list with a peak
function rebuildBoxes(){
  boxValues = buildSymmetric(baseRamp);
  boxes.length = 0;
  
  const numOfBoxes = boxValues.length;
  const usableW = canvW / numOfBoxes
  const boxH = 75;
  const boxY = canvH - boxH;
  
  for (let col = 0; col < numOfBoxes; col++){
    //const x = col *usableW;
    boxes.push(new Box(col*usableW, boxY, usableW, boxH, boxValues[col]));
  } 
}  //literally just uses a loop to create the boxes
function extendRamp(step = 10){
  const newPeak = baseRamp[baseRamp.length - 1] + step;
  baseRamp.push(newPeak);
  rebuildBoxes();
} //adds another box value to baseRamp
function shrinkRamp(){
  if (baseRamp.length > 3){
    baseRamp.pop();
    rebuildBoxes();
  }
}  //subtracts a box value from baseRamp
// ==== End Box Code ====
// ==== Ball Class ====
class Disc {
  constructor(x, y, d, xv=0, yv=0){
    this.x = x; this.y = y; this.d = d
    this.xv = xv; this.yv = yv
    this.scored = false;
  }
  get r(){ return this.d * 0.5; }

  draw(){
    fill(127); stroke(0); strokeWeight(1);
    circle(this.x, this.y, this.d)
  }
  update(){
    this.yv += 0.3;
    this.x += this.xv;
    this.y += this.yv;
  }
  pegCollision(pegs){
    const distY = this.y - pegs.y; // Y distance btw peg and disc center
    const distX = this.x - pegs.x; // X distance btw peg and dsic center
    const pegR = pegs.d * 0.5;
    const dist = Math.hypot(distY, distX) // direction distance btw peg and disc
    const minDist = this.r + pegR; //minimum distance between the edges
    
    
    if (dist > 0 && dist<minDist){ // if the distance is less than the minimum distance then: 
      const newY = distY/dist; 
      const newX = distX/dist; 
      const overlap = minDist - dist;
      this.y +=  newY * overlap
      this.x +=  newX * overlap
      let speed = Math.hypot(this.xv, this.yv) *0.9;

      if(pegs.volatility == 1){
        this.yv = newY * speed
        this.xv = newX * speed + random(-0.1, 0.1);
      } else if(pegs.volatility > 1){
           speed *= pegs.volatility;
           this.yv = newY * speed;
           this.xv = newX * speed;
      }
      if(pegs.dupeStr > 1){
        discs.push(new Disc(random(canvW), 50, this.d*0.5))
      }
    }
  }
  keepInBounds(){
    if(this.x<this.r){this.x =this.r; this.xv *= -0.6}
    if(this.x>canvW-this.r){this.x = canvW-this.r; this.xv *= -0.6}
    if(this.y<this.r){this.y = this.r; this.yv *= -0.6}
    if(this.y>canvH-this.r){this.y = canvH-this.r; this.yv *= -0.6}
  }
}
function clearDiscs(){
  discs.length = 0
}
// ==== EndBall Class ====
// ==== Ball Code  ====
function mousePressed(){
  if (mouseY > 100){
  discs.push(new Disc(mouseX, 50, 30));
  }
}
// ==== End Ball Code  ====
// ==== SETUP ====
function setup() {


  createCanvas(canvW, canvH);
  drawEvenFunc(75, 150, 40);
  drawOddFunc(125, 250, 40)
  
  // ==== Clear Peg Button ====
  specialClearBttn = createButton("Clear")
  specialClearBttn.position(200, 20)
  specialClearBttn.mousePressed(() =>{
      clearSpecialPegs();
      clearDiscs();
      score = 0
  });
  // ==== End Clear Peg Button ====
  // ==== Make Peg Button ====
  specialButton = createButton("Make Special Pegs")
  specialButton.position(20,20);
  specialButton.mousePressed(() =>{
      clearSpecialPegs();
      makeVolatilePegs();
      makeDupePegs();
      clearDiscs();
      
  }); 
  // ==== End Make Peg Button ====
  // ==== Box Code + Button ====

  rebuildBoxes();
  
  const growBtn = createButton("Add Boxes");
  growBtn.position(20,60);
  growBtn.mousePressed(() =>extendRamp(10));
  
  const shrinkBtn = createButton("Remove 2 Boxes");
  shrinkBtn.position(120, 60);
  shrinkBtn.mousePressed(shrinkRamp);
  // ==== End Box Code + Button ====
  pegs = [...pegsEven,...pegsOdd]
}
// ==== END SETUP ====

// ==== DRAW ====
function draw() {
  background(220);
  fill(20); noStroke(); textSize(18);
  text(`Score: ${score}`, canvW-100, 24);
  for (const p of pegs) {
    p.draw();
  }
  for (const b of boxes) b.draw();
  for (const dis of discs) {
    dis.update();
    for (const p of pegs){
      dis.pegCollision(p);
    }
    for (const box of boxes){
      if(box.scoreIfHit(dis)) break;
    }
    dis.keepInBounds()
    dis.draw();

  }
}
// ==== END DRAW ====