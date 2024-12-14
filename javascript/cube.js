const cube = (function () {
	// Properties that hardly change (exception being getters)
	const constants = {
		// Related to movement
		MIN_SPEED: 1,
		MAX_SPEED: 2,

		// Related to color
		COLOR_RANGE: { MIN: 0, MAX: 255 },

		// Misc. properties
		get MAX_WIDTH() {
			return document.documentElement.clientWidth;
		},
		get MAX_HEIGHT() {
			return document.documentElement.clientHeight;
		},
		CUBE_COUNT: 200,
		MIN_SIZE: 3,
		MAX_SIZE: 5,
		FRAME_DELAY: 10,
		ARTICLES: document.querySelectorAll("article"),
	};

	// Properties that keep track of the game's current state
	const state = {
		animationFrameId: null,
		lastTime: 0,
		hasRun: false,
		isClicked: false,
	};

	// "Game-world" objects
	const objects = {
		cubeArray: [],
	};

	function main() {
		// Prevent the script from getting called several times
		if (state.hasRun) return console.log("Cubes has already been run.");
		state.hasRun = true;

		const bodyElement = document.querySelector("body");
		const formElement = document.querySelector("form[id='startMenu'");

		// Initial page / element styling
		document.title = "Cubes";
		bodyElement.style.backgroundColor = "black";
		formElement.addEventListener("submit", (event) => {
			if (event.submitter.name !== "cubes") state.hasRun = false;
		});

		// Fill the cube array with random cubes + elements that are already present
		// We first add the already existing elements, then we create new DOM elements for each extra cube
		objects.cubeArray = Array.from({ length: constants.CUBE_COUNT + constants.ARTICLES.length }, (event, index) => {
			return createCube(index);
		});

		// Append all the new DOM elements except for those of the cubes that were already present
		for (const [index, cube] of objects.cubeArray.entries()) {
			if (index <= constants.ARTICLES.length - 1) continue;
			bodyElement.insertAdjacentElement("beforeend", cube.domElement);
		}

		// User input listener
		document.addEventListener("keydown", handleInput);

		// Initial animation start
		state.animationFrameId = requestAnimationFrame(animate);
	}

	function animate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - state.lastTime;

		if (timeElapsed > constants.FRAME_DELAY) {
			// Move the cubes and update their colors
			updateMovement();

			// Update the last time to the current time
			state.lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (state.animationFrameId !== null) state.animationFrameId = requestAnimationFrame(animate);
	}

	function updateMovement() {
		// Go through each cube and move them along both axes
		for (const [cube, { position, domElement, fillColor, width, height }] of Object.entries(objects.cubeArray)) {
			domElement.style.backgroundColor = adjustColor(fillColor, constants.COLOR_RANGE.MIN, constants.COLOR_RANGE.MAX);

			for (const axis of ["x", "y"]) {
				const positionInfo = position[axis];
				const isXAxis = axis === "x";
				const currentPosition = parseInt(domElement.style[isXAxis ? "left" : "top"]) || 0;

				// Calculate new position based on direction state
				const change = positionInfo.directionState ? positionInfo.margin : -positionInfo.margin;
				const newPosition = currentPosition + change;

				// Check for boundary collisions and update direction state
				const boundaryLimit = newPosition + (isXAxis ? width : height);
				if (boundaryLimit >= (isXAxis ? constants.MAX_WIDTH : constants.MAX_HEIGHT) || newPosition <= 0) {
					positionInfo.directionState = !positionInfo.directionState; // Toggle direction
				}

				// Update the DOM element's posit ion
				domElement.style[isXAxis ? "left" : "top"] = `${Math.max(0, newPosition)}px`; // Ensure position is not negative
			}
		}
	}

	function createCube(index) {
		// Create and style a cube object and it's associated DOM element and return the object, uses existing element if present
		const { ARTICLES, MIN_SIZE, MAX_SIZE, COLOR_RANGE, MIN_SPEED, MAX_SPEED } = constants;
		if (index > ARTICLES.length - 1) {
			const width = getRandomInt(MIN_SIZE, MAX_SIZE);
			const height = getRandomInt(MIN_SIZE, MAX_SIZE);
			const positionX = getRandomInt(0, constants.MAX_WIDTH - width);
			const positionY = getRandomInt(0, constants.MAX_HEIGHT - height);
			const color = getRandomColor(COLOR_RANGE.MIN, COLOR_RANGE.MAX);

			return {
				width,
				height,
				position: {
					x: {
						value: positionX,
						margin: getRandomInt(MIN_SPEED, MAX_SPEED),
						directionState: getRandomBool(),
					},
					y: {
						value: positionY,
						margin: getRandomInt(MIN_SPEED, MAX_SPEED),
						directionState: getRandomBool(),
					},
				},
				fillColor: color,
				domElement: createNewElement("article", { style: { width: `${width}px`, height: `${height}px`, left: `${positionX}px`, top: `${positionY}px`, backgroundColor: `rgb(${color[0].value}, ${color[1].value}, ${color[2].value})` } }),
			};
		} else {
			const element = ARTICLES[index];

			// We just consider every article element present before we filled
			// out our cube array to be the "correct" targets to click on
			element.addEventListener("click", () => {
				element.classList.add("isClicked");
				pauseAnimation();
			});

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
						margin: getRandomInt(MIN_SPEED, MAX_SPEED),
						directionState: getRandomBool(),
					},
					y: {
						value: element.offsetTop,
						margin: getRandomInt(MIN_SPEED, MAX_SPEED),
						directionState: getRandomBool(),
					},
				},
				fillColor: `rgb(${rgbObj[0].value}, ${rgbObj[1].value}, ${rgbObj[2].value})`,
				domElement: element,
			};
		}
	}

	function handleInput(event) {
		const input = event.code.toLowerCase();

		// Handle the space key for pausing/resuming
		if (input !== "space") return;
		state.animationFrameId === null ? resumeAnimation() : pauseAnimation();
	}

	function pauseAnimation() {
		cancelAnimationFrame(state.animationFrameId);
		state.animationFrameId = null;
	}

	function resumeAnimation() {
		// When a correct target is clicked we wish to randomize a few properties when we resume
		const clickedCubes = objects.cubeArray.filter((cube) => cube.domElement.classList.contains("isClicked"));

		for (const cube of clickedCubes) {
			const { MIN_SPEED, MAX_SPEED } = constants;
			cube.domElement.classList.remove("isClicked");
			cube.domElement.style.left = `${getRandomInt(0, constants.MAX_WIDTH - cube.width)}px`;
			cube.domElement.style.top = `${getRandomInt(0, constants.MAX_HEIGHT - cube.height)}px`;
			for (const axis of ["x", "y"]) {
				cube.position[axis].margin = getRandomInt(MIN_SPEED, MAX_SPEED);
				cube.position[axis].directionState = getRandomBool();
			}
		}
		state.animationFrameId = requestAnimationFrame(animate);
	}

	return {
		run: main,
	};
})();
