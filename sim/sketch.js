var screenX;
var screenY;
var centerX;
var centerY;
var menu;

let x = 0;
var cars = [];
var streets = [];
var cross = [];

const _LESTE = 0;
const _SUL   = Math.PI/2;
const _OESTE = Math.PI;
const _NORTE = 3*Math.PI/2;

const STREET_WIDTH = 30;
const CAR_WIDTH    = 19;
const CAR_LENGTH   = 35;

mouseHolding = null;

function addRoad() {
  setTimeout(function() {
    mouseHolding = 'road_start';
  }, 10);
}

function addConnect() {
  setTimeout(function() {
    mouseHolding = 'road_connect';
  }, 10);
}

function setup() {
  screenX = windowWidth;
  screenY = windowHeight;
  centerX = screenX/2;
  centerY = screenY/2;

  createCanvas(screenX, screenY);

  menu = new Menu();
  menu.setup();

  loadDefaultEntities();
}

let isMousePressed = 0;
let mousePressedLocation = [0, 0];
let myscale = 0.8;

function draw() {
  background(204);

  push();
  
  translate(centerX, centerY);
  scale(myscale);

  if (isMousePressed){
    centerX = -mousePressedLocation[0] + mouseX;
    centerY = -mousePressedLocation[1] + mouseY;
  }

  cross.forEach((cross) => {
    cross.display();
    cross.manage();
  });

  streets.forEach((street) => {
    street.display();
  });

  cars.forEach((car) => {
    car.move();
    car.display();
  });

  /*let mmcoords = getMouseCoords();
  let mouse_real_coords = new AllignedPosition(mmcoords[0] / myscale, mmcoords[1] / myscale, -Math.PI/5);

  if (mouseHolding == 'road_start') {
    new Street(
      'streetX',
      mouse_real_coords, 
      50, STREET_WIDTH
    ).display();
  } else if (mouseHolding?.type == 'street') {
    mouseHolding.end    = mouse_real_coords;
    mouseHolding.length = mouse_real_coords.distance(mouseHolding.start);
    mouseHolding.start.dir = createVector(1,0).angleBetween(createVector(mouse_real_coords.x - mouseHolding.start.x, mouse_real_coords.y - mouseHolding.start.y));
    mouseHolding.end.dir = mouseHolding.start.dir;
    mouseHolding.display();
  } else if (mouseHolding == 'road_connect') {
    streets.forEach( (street) => {
      push();
        stroke(128);
        fill(128);
        if (mouse_real_coords.distance(street.end) < 15) {
          stroke(255);
          fill(255);
        }
        ellipse(street.end.x, street.end.y, 10, 10); 
      pop();
    });
  } else if (mouseHolding?.type == 'road_connect') {
    push();
      stroke(color(0,0,255));
      fill(color(0,0,255));
      ellipse(mouseHolding.start.end.x, mouseHolding.start.end.y, 10, 10); 
    pop();

    streets.forEach( (street) => {
      push();
        stroke(128);
        fill(128);
        if (mouse_real_coords.distance(street.start) < 15) {
          stroke(255);
          fill(255);
        }
        ellipse(street.start.x, street.start.y, 10, 10); 
      pop();
    });
  }*/

  pop();
  menu.draw();
}

function windowResized() {
  centerX += (windowWidth - screenX) / 2;
  centerY += (windowHeight - screenY) / 2;
  screenX = windowWidth;
  screenY = windowHeight;
  resizeCanvas(screenX, screenY); 
}

function mousePressed() {
  isMousePressed = 1;
  mousePressedLocation = getMouseCoords();

  let mmcoords = getMouseCoords();
  let mouse_real_coords = new AllignedPosition(mmcoords[0] / myscale, mmcoords[1] / myscale, -Math.PI/5);

  if (mouseHolding == 'road_start') {
    coords = getMouseCoords();
    mouseHolding = new Street(
      'streetX',
      new AllignedPosition(coords[0] / myscale, coords[1] / myscale, 0), 
      baseLen, STREET_WIDTH
    );
  } else if (mouseHolding?.type == 'street') {
    streets.push(mouseHolding);
    mouseHolding = null;
  } else if (mouseHolding == 'road_connect') {
    var selected = null;
    streets.forEach( (street) => {
      if (mouse_real_coords.distance(street.end) < 15) {
        selected = street;
      }
    });
    if (selected) {
      mouseHolding = {
        type: 'road_connect',
        start: selected,
      }
    }
  } else if (mouseHolding?.type == 'road_connect') {
    var selected = null;
    streets.forEach( (street) => {
      if (mouse_real_coords.distance(street.start) < 15) {
        selected = street;
      }
    });
    if (selected) {
      let turnAB = new Turn('turnABasdasd', mouseHolding.start.end, selected.start, STREET_WIDTH);
      mouseHolding.start.next = turnAB;
      turnAB.next = selected;
      mouseHolding = null;
      streets.push(turnAB);
    }
  }
}

function mouseReleased() {
  isMousePressed = 0;
}

function getMouseCoords() {
  return [
    mouseX-centerX,
    mouseY-centerY,
  ];
}

function mouseWheel(event) {
  let zoomAmount = 0.1;

  if (event.delta < 0) {
    myscale *= 1 + zoomAmount;
    centerX -= (mouseX - centerX) * 0.1;
    centerY -= (mouseY - centerY) * 0.1;
    mousePressedLocation = getMouseCoords();
  } else {
    myscale /= 1 + zoomAmount;
    centerX += (mouseX - centerX) * (1-1/(1+zoomAmount));
    centerY += (mouseY - centerY) * (1-1/(1+zoomAmount));
    mousePressedLocation = getMouseCoords();
  }
}