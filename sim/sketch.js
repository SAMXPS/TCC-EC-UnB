var screenX;
var screenY;
var centerX;
var centerY;
var menu;

let x = 0;
var simulation;

const _LESTE = 0;
const _SUL = Math.PI / 2;
const _OESTE = Math.PI;
const _NORTE = 3 * Math.PI / 2;

const STREET_WIDTH = 30;
const CAR_WIDTH = 19;
const CAR_LENGTH = 35;

async function setup() {
	screenX = windowWidth;
	screenY = windowHeight;
	centerX = screenX / 2;
	centerY = screenY / 2;

	createCanvas(screenX, screenY);

	menu = new Menu();
	menu.setup();

	simulation = await loadSimulation();

	simulation.cross.forEach((cross)=>{
		cross.startThread();
	});
}

let isMousePressed = 0;
let mousePressedLocation = [0, 0];
let myscale = 0.8;

function draw() {
    frameRate(30);
	background(204);

	push();

	translate(centerX, centerY);
	scale(myscale);

	if (isMousePressed) {
		centerX = -mousePressedLocation[0] + mouseX;
		centerY = -mousePressedLocation[1] + mouseY;
	}

	simulation.cross.forEach((cross) => {
		cross.display();
	});

	simulation.streets.forEach((street) => {
		street.display();
	});

	simulation.cars.forEach((car) => {
		car.move();
		car.display();
	});

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
}

function mouseReleased() {
	isMousePressed = 0;
}

function getMouseCoords() {
	return [
		mouseX - centerX,
		mouseY - centerY,
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
		centerX += (mouseX - centerX) * (1 - 1 / (1 + zoomAmount));
		centerY += (mouseY - centerY) * (1 - 1 / (1 + zoomAmount));
		mousePressedLocation = getMouseCoords();
	}
}