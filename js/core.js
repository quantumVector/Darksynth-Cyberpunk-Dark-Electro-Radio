const radius = 200;
let font;
let fontRegular;
let audio = document.querySelector('audio');
const trackList = [
  'songs/title(Head Splitter - Scavengers Music).mp3',
  'songs/title(Quinze - Le Glas).mp3',
  'songs/title(Quok - Wonderland).mp3',
  'songs/title(Matteo Tura - Larsen).mp3',
  'songs/title(Matteo Tura - Fall).mp3',
  'songs/title(Mois Blak - Umbra).mp3',
  'songs/title(Lyde - Augmentation).mp3',
  'songs/title(ASSALM - Chimera).mp3',
  'songs/title(Revizia - Assault).mp3',
  'songs/title(Vakhtang - ONLY).mp3',
  'songs/title(Lyde - Afterlife Avenue).mp3',
  'songs/title(XYXXYYYXXYX - Obscenity).mp3',
  'songs/title(Lazerpunk - Nightcrawler).mp3',
  'songs/title(Vakhtang - Some Things).mp3',
  'songs/title(SWARM - Kill Me).mp3',
  'songs/title(GRoost - Flexibility of Mind).mp3',
  'songs/title(Goge-L - Dogfight).mp3',
  'songs/title(Goge-L - De Humanization).mp3',
  'songs/title(HIPPO - M Y).mp3',
  'songs/title(GRoost - Howl).mp3',
  'songs/title(Kage - Time).mp3',
  'songs/title(Cyberpunk 2077 - Scavenger Hideout).mp3',
  'songs/title(Cyberpunk 2077 - Spiderbot).mp3',
  'songs/title(Boris Brejcha - Devil).mp3',
  'songs/title(t_error 404 - Astramental).mp3',
  'songs/title(t_error 404 - Alien Angel).mp3',
  'songs/title(t_error 404 - New Knowledge).mp3',
  'songs/title(t_error 404 - Tantra Centauri).mp3',
];
let shuffledTrackList;
const infoBox = document.getElementById('track-info-box');
const volumeContainer = document.getElementById('volume-container');
const btnPrevious = document.getElementById('previous');
const btnForward = document.getElementById('forward');
const volume = document.getElementById('volume');
const volumeLvl = document.getElementById('volume-level');

function preload() {
  font = loadFont('/fonts/InterExtraLight.ttf');
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);

  cnv.style('display', 'block');

  noStroke();
}

function draw() {
  visualizer.draw();
}

function windowResized() {
  setup();
}

function mouseClicked(e) {
  let target = e.target;

  if (target.id === 'volume' || target.id === 'artist' ||
    target.id === 'title' || target.id === 'logo-title' ||
    target.id === 'previous' || target.id === 'forward') return;

  if (!visualizer.prepared) {
    shuffledTrackList = trackList.slice();
    visualizer.shuffle(shuffledTrackList);

    audio.src = shuffledTrackList[0];
    audio.play();
    audio.volume = 0.5;
    visualizer.preparation();
    visualizer.prepared = true;
    visualizer.play = true;
    visualizer.loop = true;
    visualizer.draw();

    volumeContainer.style.opacity = '1';
    volumeContainer.style.visibility = 'visible';
    btnPrevious.style.opacity = '1';
    btnPrevious.style.visibility = 'visible';
    btnForward.style.opacity = '1';
    btnForward.style.visibility = 'visible';
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

btnForward.onclick = () => {
  visualizer.hideTrackInfo();
  visualizer.trackInfo = false;
  visualizer.playNextTrack();
}

btnPrevious.onclick = () => {
  visualizer.hideTrackInfo();
  visualizer.trackInfo = false;
  visualizer.playPreviousTrack();
}

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
    this.currentTrackIndex = 0;
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

  // алгоритм Тасование Фишера — Йетса
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  playNextTrack() {
    const nextTrackIndex = this.currentTrackIndex + 1;

    if (nextTrackIndex <= shuffledTrackList.length - 1) {
      audio.src = shuffledTrackList[nextTrackIndex];
      this.currentTrackIndex = nextTrackIndex;
    } else {
      audio.src = shuffledTrackList[0];
      this.currentTrackIndex = 0;
    }

    audio.play();
  }

  playPreviousTrack() {
    const previousTrackIndex = this.currentTrackIndex - 1;

    if (previousTrackIndex >= 0) {
      audio.src = shuffledTrackList[previousTrackIndex];
      this.currentTrackIndex = previousTrackIndex;
    } else {
      audio.src = shuffledTrackList[shuffledTrackList.length - 1];
      this.currentTrackIndex = shuffledTrackList.length - 1;
    }

    audio.play();
  }
}

let visualizer = new Visualizer();
