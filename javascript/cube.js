const cubes = (function () {
	let { clientWidth: maxWidth, clientHeight: maxHeight } = document.body;
	let animationFrameId = null;
	let cubeArray = [];
	let lastTime = 0;
	let hasRun = false;  // Flag to prevent multiple runs

	// Defining the constants
	const cubeConstants = {
		CUBE_COUNT: 200,
		MIN_SIZE: 3,
		MAX_SIZE: 5,
		MIN_SPEED: 1,
		MAX_SPEED: 2,

		IS_CLICKED: false,
		FRAME_DELAY: 10,

		ARTICLES: document.querySelectorAll("article"),
		COLOR_RANGE: { MIN: 0, MAX: 255 },
	}

	function main() {
		if (hasRun) {
		  console.log("Cubes has already been run.");
		  return;
		}

		hasRun = true;

		const bodyElement = document.querySelector("body");
		const formElement = document.querySelector("form[id='startMenu'");
		formElement.addEventListener("submit", (event) => {
			if (event.submitter.name !== "cubes") hasRun = false;
		})

		// Fill the cube array with random cubes + elements that are already present
		// We first add the already existing elements, then we create new DOM elements for each extra cube
		cubeArray = Array.from({ length: cubeConstants.CUBE_COUNT + cubeConstants.ARTICLES.length }, (event, index) => {
			return createCube(index);
		});

		// Append all the new DOM elements except for those of the cubes that were already present
		cubeArray.forEach((cube, index) => {
			if (index > (cubeConstants.ARTICLES.length - 1)) {
				bodyElement.insertAdjacentElement("beforeend", cube.domElement);
			}
		});

		window.addEventListener("resize", () => {
			maxWidth = document.body.clientWidth;
			maxHeight = document.body.clientHeight;
		});

		// User input listener
		document.addEventListener("keydown", (event) => {
			const input = event.code.toLowerCase();

			// Handle the space key for pausing/resuming
			if (input === "space") {
				if (animationFrameId === null) {
					resumeAnimation();
				} else {
					pauseAnimation();
				}
			}
		});

		// Specific click listener for the "correct" article
		cubeArray[0].domElement.addEventListener("click", () => cubeConstants.IS_CLICKED = true);

		// Start the game initially
		animationFrameId = requestAnimationFrame(cubesAnimate);
	}

	// To animate the cubes array
	function cubesAnimate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - lastTime;

		if (timeElapsed > cubeConstants.FRAME_DELAY) {
			// Randomly move the form if it got clicked
			if (cubeConstants.IS_CLICKED) {
				cubeArray[0].domElement.style.left = `${getRandomInt(0, maxWidth - cubeArray[0].width)}px`;
				cubeArray[0].domElement.style.top = `${getRandomInt(0, maxHeight - cubeArray[0].height)}px`;
				for (const [axis] of Object.entries(cubeArray[0].position)) {
					cubeArray[0].position[axis].margin = getRandomInt(cubeConstants.MIN_SPEED, cubeConstants.MAX_SPEED);
					cubeArray[0].position[axis].directionState = getRandomBool();
				}
				cubeConstants.IS_CLICKED = false;
			}

			// Move the cubes and update their colors
			cubeArray.forEach((cube) => {
				cube.domElement.style.backgroundColor = adjustColor(cube.fillColor, cubeConstants.COLOR_RANGE.MIN, cubeConstants.COLOR_RANGE.MAX);
				cubeMovement(cube);
			});

			// Update the last time to the current time
			lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (animationFrameId !== null) animationFrameId = requestAnimationFrame(cubesAnimate);
	}

	// To adjust cube positions
	function cubeMovement(cube) {
		// Loop through each axis defined in the cube.position object
		for (const [axis] of Object.keys(cube.position)) {
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

	// Function to create and style a cube DOM element and returns it's associated object, uses existing element if present
	function createCube(index) {
		if (index > (cubeConstants.ARTICLES.length - 1)) {
			const width = getRandomInt(cubeConstants.MIN_SIZE, cubeConstants.MAX_SIZE);
			const height = getRandomInt(cubeConstants.MIN_SIZE, cubeConstants.MAX_SIZE);
			const positionX = getRandomInt(0, maxWidth - width);
			const positionY = getRandomInt(0, maxHeight - height);
			const color = getRandomColor(cubeConstants.COLOR_RANGE.MIN, cubeConstants.COLOR_RANGE.MAX);

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
				fillColor: color,
				domElement: createNewElement("article", { style: { width: `${width}px`, height: `${height}px`, left: `${positionX}px`, top: `${positionY}px`, backgroundColor: `rgb(${color[0].value}, ${color[1].value}, ${color[2].value})` }}),
			}
		} else {
			const element = cubeConstants.ARTICLES[index];
			const rgbString = window.getComputedStyle(element).getPropertyValue("background-color");
			const rgbArr = rgbString.slice(4, -1).split(","); // Eg something like: [200, 12, 53]
			const rgbObj = Array.from({ length: 3 }, (event, index) => ({
				value: parseInt(rgbArr[index], 10),
				state: getRandomBool(),
			}));

			return {
				width: element.clientWidth,
				height: element.clientHeight,
				position: {
					x: {
						value: element.offsetLeft,
						margin: getRandomInt(cubeConstants.MIN_SPEED, cubeConstants.MAX_SPEED),
						directionState: getRandomBool(),
					},
					y: {
						value: element.offsetTop,
						margin: getRandomInt(cubeConstants.MIN_SPEED, cubeConstants.MAX_SPEED),
						directionState: getRandomBool(),
					},
				},
				fillColor: `rgb(${rgbObj[0].value}, ${rgbObj[1].value}, ${rgbObj[2].value})`,
				domElement: element,
			}
		}
	}

	// To "pause" the animation
	function pauseAnimation() {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// To "resume" the animation
	function resumeAnimation() {
		animationFrameId = requestAnimationFrame(cubesAnimate);
	}

	return {
		run: main,
	};
})();
