const radius = 200;
let audio = document.querySelector('audio');
let visualizer;

class Visualizer {
  constructor() {
    this.play = false;
    this.loop = false;
    this.context;
    this.analyser;
    this.src;
    this.array;
  }

  preparation() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.src = this.context.createMediaElementSource(audio);
    this.src.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  draw() {
    if (this.play) {
      this.array = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(this.array);
    }

    background('#000');
    translate(width / 2, height / 2);

    textSize(70);
    fill('#00BFFF');
    textAlign(CENTER, CENTER);
    textFont('SC_Realist');
    this.drawShadow(2, -2, 10, '#00BFFF');
    text('2:06', 0, 0);

    stroke('#00BFFF');
    strokeWeight(5);
    noFill();
    this.drawShadow(0, 0, 10, '#00BFFF');
    ellipse(0, 0, 190);

    for (let i = 0; i < 160; i += 1) {
      this.drawProgress(i, 0.86);
    }

    let z = 200;

    for (let i = 0; i < 360; i += 5) {
      let lastVertex = 0;

      if (this.array) {
        lastVertex = this.array[z] / 2;
        z += 2;
      }

      this.drawPoint(i, 1, `1.${Math.floor(lastVertex)}`);
    }

    if (!this.loop) {
      noLoop();
    } else {
      loop();
    }
  }

  drawPoint(angle, distance, distance2) {
    let x = 0 + 130 * Math.cos(-angle * Math.PI / 180) * distance;
    let y = 0 + 130 * Math.sin(-angle * Math.PI / 180) * distance;
    let x2 = 0 + 130 * Math.cos(-angle * Math.PI / 180) * +distance2;
    let y2 = 0 + 130 * Math.sin(-angle * Math.PI / 180) * +distance2;

    this.drawShadow(0, 0, 50, '#00BFFF');

    stroke('#00BFFF');
    beginShape(LINES);
    strokeWeight(6);
    vertex(x, y);
    vertex(x2, y2);
    endShape();
  }

  drawProgress(angle, distance) {
    let x = 0 + 130 * Math.cos(-angle * Math.PI / 180) * distance;
    let y = 0 + 130 * Math.sin(-angle * Math.PI / 180) * distance;

    this.drawShadow(5, 0, 15, 'rgba(0, 191, 255, 0.3)');

    fill('#00BFFF');
    ellipse(x, y, 5);
  }

  drawShadow(x, y, blur, color) {
    drawingContext.shadowOffsetX = x;
    drawingContext.shadowOffsetY = y;
    drawingContext.shadowBlur = blur;
    drawingContext.shadowColor = color;
  }
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);

  cnv.style('display', 'block');
  visualizer = new Visualizer();

  noStroke();
}

function draw() {
  visualizer.draw();
}

function mouseClicked() {
  audio.play();
  visualizer.preparation();
  visualizer.play = true;
  visualizer.loop = true;
  visualizer.draw();
}