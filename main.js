const docWidth = document.documentElement.clientWidth;
const docHeight = document.documentElement.clientHeight;
const bodyElement = document.querySelector("body");
const articleElements = document.querySelectorAll("article");
const CUBE_COUNT = 500;
const MIN_SIZE = 10;
const MAX_SIZE = 200;
const COLOR_RANGE = 255;
const MIN_SPEED = 1;
const MAX_SPEED = 20;

// Constants for color state
const INCREASING = true;
const DECREASING = false;

// Initialize the cube array with random cubes + those already present (articles)
const cubeArray = Array.from({ length: CUBE_COUNT + articleElements.length }, (event, index) => {
	const width = getRandomInt(MIN_SIZE, MAX_SIZE);
	const height = getRandomInt(MIN_SIZE, MAX_SIZE);
	let cubeInfo = {
		width,
		height,
		position: {
			x: {
				value: getRandomInt(0, docWidth - width),
				margin: getRandomInt(MIN_SPEED, MAX_SPEED),
				directionState: getRandomBool(),
			},
			y: {
				value: getRandomInt(0, docHeight - height),
				margin: getRandomInt(MIN_SPEED, MAX_SPEED),
				directionState: getRandomBool(),
			},
		},
		color: getRandomColor(),
	};

	// Create DOM elements for each cube, or using those that already exist
	if (index < articleElements.length) {
		// const elementInfo = enlistCube();
		cubeInfo.domElement = articleElements[index];
		cubeInfo.domElement.style.width = `${cubeInfo.width}px`;
		cubeInfo.domElement.style.height = `${cubeInfo.height}px`;
		cubeInfo.domElement.style.left = `${cubeInfo.position.x.value}px`;
		cubeInfo.domElement.style.top = `${cubeInfo.position.y.value}px`;
		cubeInfo.domElement.style.backgroundColor = `rgb(${cubeInfo.color[0].value}, ${cubeInfo.color[1].value}, ${cubeInfo.color[2].value})`;
	} else {
		cubeInfo.domElement = createCube(cubeInfo.width, cubeInfo.height, cubeInfo.position.x.value, cubeInfo.position.y.value, cubeInfo.color);
	}

	return cubeInfo;
});

// Start the game initially
let mainInterval = setInterval(main, 30);
let intervalPauze = false;

// User input listener
addEventListener("keydown", (event) => {
	// "stop" or "resume" the repeating interval if the space-bar is pressed (in reality creates an entirely new interval instead of using the old one)
	if (event.code.toLowerCase().includes("space") && !intervalPauze) {
		clearInterval(mainInterval);
		intervalPauze = true;
	} else if (event.code.toLowerCase().includes("space") && intervalPauze) {
		mainInterval = setInterval(main, 30);
		intervalPauze = false;
	}
});

// Main function to update cubes
function main() {
	cubeArray.forEach((cube) => {
		adjustColor(cube);
		movement(cube);
	});
}

// Function to adjust cube positions
function movement(cube) {
	// Loop through each axis defined in the cube.position object
	for (const axis of Object.keys(cube.position)) {
		const positionInfo = cube.position[axis];
		const isXAxis = axis === "x";
		const currentPosition = parseInt(cube.domElement.style[isXAxis ? "left" : "top"]) || 0;

		// Calculate new position based on direction state
		const change = positionInfo.directionState ? positionInfo.margin : -positionInfo.margin;
		const newPosition = currentPosition + change;

		// Check for boundary collisions and update direction state
		if (newPosition + (isXAxis ? cube.width : cube.height) >= (isXAxis ? docWidth : docHeight) || newPosition <= 0) {
			positionInfo.directionState = !positionInfo.directionState; // Toggle direction
		}

		// Update the DOM element's position
		cube.domElement.style[isXAxis ? "left" : "top"] = `${Math.max(0, newPosition)}px`; // Ensure position is not negative
	}
}

// Function to adjust color values
function adjustColor(cube) {
	// Loop through each color component defined in the cube.color array
	for (const color of cube.color) {
		// Adjust value based on state
		color.value += color.state ? -1 : 1;

		// Clamp values and update state accordingly
		if (color.value <= 0) {
			color.value = 0;
			color.state = DECREASING; // Start increasing when reaching 0
		} else if (color.value >= COLOR_RANGE) {
			color.value = COLOR_RANGE;
			color.state = INCREASING; // Start decreasing when reaching max
		}
	}

	// Update the DOM element's background color after adjusting all components
	cube.domElement.style.backgroundColor = `rgb(${cube.color[0].value}, ${cube.color[1].value}, ${cube.color[2].value})`;
}

// Function to create a cube DOM element
function createCube(width, height, x, y, color) {
	const cube = document.createElement("article");
	cube.style.width = `${width}px`;
	cube.style.height = `${height}px`;
	cube.style.left = `${x}px`;
	cube.style.top = `${y}px`;
	cube.style.backgroundColor = `rgb(${color[0].value}, ${color[1].value}, ${color[2].value})`;

	bodyElement.appendChild(cube);
	return cube;
}

// Function to generate a random integer within a specified range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// Function to generate a random boolean value
function getRandomBool() {
    return Math.random() < 0.5; // Returns true or false with equal probability
}

// Function to generate a random color as an array of RGB values
function getRandomColor() {
    return Array.from({ length: 3 }, () => ({
        value: getRandomInt(0, COLOR_RANGE),
        state: getRandomBool(),
    }));
}
