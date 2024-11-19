// Using IIFE to avoid name clashes between files
const cubes = (function () {
	let { clientWidth: maxWidth, clientHeight: maxHeight } = document.documentElement;
	let animationFrameId = null;
	let mainInterval;

	// Defining the constants
	const cubeConstants = {
		CUBE_COUNT: 1000,
		COLOR_RANGE: 255,
		MIN_SIZE: 3,
		MAX_SIZE: 5,
		MIN_SPEED: 1,
		MAX_SPEED: 20,
		ARTICLES: document.querySelectorAll("article"),
	
		// Constants for color state
		INCREASING: true,
		DECREASING: false,
	}

	// The game function to loop
	function cubesGame(cubeArray) {
		cubeArray.forEach((cube) => {
			cube.domElement.style.backgroundColor = adjustColor(cube.fillColor);
			cubeMovement(cube);
		});
	}

	// Main function to start game
	function main() {
		const bodyElement = document.querySelector("body");

		// User input listener
		addEventListener("keydown", (event) => {
			// "stop" or "resume" the repeating interval if the space-bar is pressed
			if (event.code.toLowerCase().includes("space") && !intervalPauze) {
				clearInterval(mainInterval);
				intervalPauze = true;
			} else if (event.code.toLowerCase().includes("space") && intervalPauze) {
				mainInterval = setInterval(() => {
					cubesGame(cubeArray);
				}, 30);
				intervalPauze = false;
			}
		});
		
		// Initialize the cube array with random cubes + elements that are already present
		let cubeArray = Array.from({ length: cubeConstants.CUBE_COUNT + cubeConstants.ARTICLES.length }, (event, index) => {
			return getCubeInfo(cubeConstants.ARTICLES[index]);
		});

		// Append the DOM elements after we start the game
		cubeArray.forEach((cube) => {
			bodyElement.insertAdjacentElement("beforeend", cube.domElement);
		});

		// Start the game
		mainInterval = setInterval(() => {
			cubesGame(cubeArray);
		}, 30);
		intervalPauze = false;
	}

	// Function to adjust cube positions
	function cubeMovement(cube) {
		// Loop through each axis defined in the cube.position object
		for (const axis of Object.keys(cube.position)) {
			const positionInfo = cube.position[axis];
			const isXAxis = axis === "x";
			const currentPosition = parseInt(cube.domElement.style[isXAxis ? "left" : "top"]) || 0;

			// Calculate new position based on direction state
			const change = positionInfo.directionState ? positionInfo.margin : -positionInfo.margin;
			const newPosition = currentPosition + change;

			// Check for boundary collisions and update direction state
			if (newPosition + (isXAxis ? cube.width : cube.height) >= (isXAxis ? maxWidth : maxHeight) || newPosition <= 0) {
				positionInfo.directionState = !positionInfo.directionState; // Toggle direction
			}

			// Update the DOM element's position
			cube.domElement.style[isXAxis ? "left" : "top"] = `${Math.max(0, newPosition)}px`; // Ensure position is not negative
		}
	}

	// Function to adjust color values
	function adjustColor(fillColor) {
		// Loop through each color component defined in the cube.color array
		for (const color of fillColor) {
			// Adjust value based on state
			color.value += color.state ? -1 : 1;

			// Clamp values and update state accordingly
			if (color.value <= 0) {
				color.value = 0;
				color.state = cubeConstants.DECREASING; // Start increasing when reaching 0
			} else if (color.value >= cubeConstants.COLOR_RANGE) {
				color.value = cubeConstants.COLOR_RANGE;
				color.state = cubeConstants.INCREASING; // Start decreasing when reaching max
			}
		}

		// Update the DOM element's background color after adjusting all components
		return `rgb(${fillColor[0].value}, ${fillColor[1].value}, ${fillColor[2].value})`;
	}

	// Function to create and style a cube DOM element and returns it's associated object, uses existing element if present
	function createCube({ width, height, positionX, positionY, color }, cube) {
		if (!cube) {
			cube = document.createElement("article");
		}
		cube.style.width = `${width}px`;
		cube.style.height = `${height}px`;
		cube.style.left = `${positionX}px`;
		cube.style.top = `${positionY}px`;
		cube.style.backgroundColor = `rgb(${color[0].value}, ${color[1].value}, ${color[2].value})`;

		return {
			width,
			height,
			position: {
				x: {
					value: positionX,
					margin: getRandomInt(cubeConstants.MIN_SPEED, cubeConstants.MAX_SPEED),
					directionState: getRandomBool(),
				},
				y: {
					value: positionY,
					margin: getRandomInt(cubeConstants.MIN_SPEED, cubeConstants.MAX_SPEED),
					directionState: getRandomBool(),
				},
			},
			fillColor: color && getRandomColor(0, 255),
			domElement: cube,
		}
	};

	function getCubeInfo(element) {
		// We first add the already existing elements, then we create new DOM elements for each cube
		if (element) {
			const rgbString = window.getComputedStyle(element).getPropertyValue("background-color");
			const rgbArr = rgbString.slice(4, -1).split(","); // Eg something like: [200, 12, 53]
			const rgbObj = Array.from({ length: 3 }, (event, index) => ({
				value: parseInt(rgbArr[index], 10),
				state: getRandomBool(),
			}));

			return createCube({
				width: element.clientWidth,
				height: element.clientHeight,
				positionX: element.offsetLeft,
				positionY: element.offsetTop,
				color: rgbObj,
			}, element);
		} else {
			const width = getRandomInt(cubeConstants.MIN_SIZE, cubeConstants.MAX_SIZE);
			const height = getRandomInt(cubeConstants.MIN_SIZE, cubeConstants.MAX_SIZE);
			return createCube({
				width,
				height,
				positionX: getRandomInt(0, maxWidth - width),
				positionY: getRandomInt(0, maxHeight - height),
				color: getRandomColor(cubeConstants.COLOR_RANGE),
			}, false);
		}
	};

	return {
		run: main,
	};
})();
