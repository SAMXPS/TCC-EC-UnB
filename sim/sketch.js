var screenX;
var screenY;
var centerX;
var centerY;
var menu;
var simulation;

const STREET_WIDTH   = 30; 			// 3.0 m
const STREET_LENGTH  = 500;         //50.0 m
const CAR_WIDTH      = 19; 			// 1.9 m 
const CAR_LENGTH     = 35; 			// 3.5 m 
const CAR_MAX_SPEED  = kmh_dms(60); //  60 km/h
const CAR_TURN_SPEED = kmh_dms(30);	//  30 km/h
const CAR_ACCEL      = 25; 			// 2.5 m/s^2
const CAR_BRAKE      = 70; 			// 7.0 m/s^2

const SIMULATION_TICK_PERIOD = 25;						//  25 ms
const CROSS_MAX_LATENCY = 4 * SIMULATION_TICK_PERIOD;	// 100 ms

async function setup() {
	screenX = windowWidth;
	screenY = windowHeight;
	centerX = screenX / 2;
	centerY = screenY / 2;

	createCanvas(screenX, screenY);

	menu = new Menu();
	menu.setup();

	simulation = await loadSimulation();
}

let isMousePressed = 0;
let mousePressedLocation = [0, 0];
let myscale = 0.8;

function draw() {
    frameRate(60);
	background(204);

	push();

	translate(centerX, centerY);
	scale(myscale);

	if (isMousePressed) {
		centerX = -mousePressedLocation[0] + mouseX;
		centerY = -mousePressedLocation[1] + mouseY;
	}

	simulation.getElements().forEach((element) => {
		element.display();
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