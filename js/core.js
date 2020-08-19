const radius = 200;
let font;
let fontRegular;
let audio = document.querySelector('audio');
const trackList = [
  'songs/title(Head Splitter - Scavengers Music).mp3',
  'songs/title(Quinze - Le Glas).mp3',
  'songs/title(Quok - Wonderland).mp3',
  'songs/title(test - testerov).mp3'
];
let editableTrackList = trackList.slice();
let visualizer;
const infoBox = document.getElementById('track-info-box');
const volume = document.getElementById('volume');
const volumeLvl = document.getElementById('volume-level');

function preload() {
  font = loadFont('/fonts/InterExtraLight.ttf');
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
  if (!visualizer.prepared) {
    let firstTrack = random(trackList);

    editableTrackList.splice(editableTrackList.indexOf(firstTrack), 1);
    audio.src = firstTrack;
    audio.play();
    visualizer.preparation();
    visualizer.prepared = true;
    visualizer.play = true;
    visualizer.loop = true;
    visualizer.draw();
  } else {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

volume.oninput = () => {
  let num;

  volumeLvl.style.height = volume.value * 130 / 100 + 10 + 'px';

  if (volume.value > 0 && volume.value <= 9) {
    num = volume.value * 0.01;
    audio.volume = num.toFixed(2);
  }
  if (volume.value > 10) {
    num = volume.value * 0.01;
    audio.volume = num.toFixed(2);
  }
  if (volume.value == 0) audio.volume = 0.0;
}

// Настроен регулятор громкости

class Visualizer {
  constructor() {
    this.prepared = false;
    this.play = false;
    this.loop = false;
    this.context;
    this.analyser;
    this.src;
    this.array;
    this.trackInfo = false;
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

    this.drawTime();

    stroke('#00BFFF');
    strokeWeight(5);
    noFill();
    this.drawShadow(0, 0, 10, '#00BFFF');
    ellipse(0, 0, 190);

    let currentDuration = audio.currentTime * 360 / audio.duration;

    if (audio.currentTime !== 0) {
      for (let i = 0; i < currentDuration; i += 1) {
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

      if (audio.currentTime === audio.duration) {
        this.hideTrackInfo();
        this.trackInfo = false;
        this.playNextTrack();
      }

      if (audio.currentTime > 1 && this.trackInfo == false) {
        this.setTrackInfo();
      }
    }
  }

  drawTime() {
    let mins = Math.floor(audio.currentTime / 60);
    let secs = Math.floor(audio.currentTime % 60);

    if (secs < 10) {
      secs = '0' + String(secs);
    }

    fill('#00BFFF');
    strokeWeight(1);
    textFont(font);
    textSize(60);
    this.drawShadow(2, -2, 10, '#00BFFF');

    if (audio.currentTime !== 0) {
      text(`${mins}:${secs}`, -60, 23);
    } else {
      text('Click', -67, 23);
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

  setTrackInfo() {
    if (!this.trackInfo) {
      infoBox.style.opacity = '1';
      infoBox.style.visibility = 'visible';

      let trackInfo = audio.outerHTML;
      let regexp = /title\((.+) - (.+)\)/;
      let result = trackInfo.match(regexp);

      document.getElementById('artist').innerHTML = result[1];
      document.getElementById('title').innerHTML = result[2];

      this.trackInfo = true;
    }
  }

  hideTrackInfo() {
    infoBox.style.opacity = '0';
    infoBox.style.visibility = 'hidden';
  }

  playNextTrack() {
    this.chooseTrack();
    audio.play();
  }

  chooseTrack() {
    let nextTrack = random(trackList);

    if (!editableTrackList.length) editableTrackList = trackList.slice();

    if (editableTrackList.indexOf(nextTrack) >= 0) {
      editableTrackList.splice(editableTrackList.indexOf(nextTrack), 1);
      audio.src = nextTrack;
    } else {
      this.chooseTrack();
    }
  }
}