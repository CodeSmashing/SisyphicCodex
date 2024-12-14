const snake = (function () {
	// Properties that hardly change (exception being getters)
	const constants = {
		// Related to movement
		MARGIN: 20,

		// Related to color
		COLOR: {
			COLOR_RANGE: { MIN: 0, MAX: 255 },
			COLOR_SNAKE: "green",
			COLOR_APPLE: "red",
		},
		CONTEXT: null,

		// Misc. properties
		FRAME_DELAY: 100, // In milliseconds
		MAX_ITERATIONS: 5,
		get MAX_WIDTH() { return document.documentElement.clientWidth; },
		get MAX_HEIGHT() { return document.documentElement.clientHeight; },
	};

	// Properties that keep track of the game's current state
	const state = {
		animationFrameId: null,
		lastTime: 0,
		lastDirection: "left",
		isSnakeAlive: true,
		highScore: 0,
		currentScore: 0,
		deathTotal: 0,
	}

	// "Game-world" objects
	const objects = {
		snakeBody: [
			{
				fillColor: constants.COLOR.COLOR_SNAKE,
				position: {
					x: getRandomIntMultiple(constants.MARGIN, constants.MAX_WIDTH - constants.MARGIN, constants.MARGIN),
					y: getRandomIntMultiple(constants.MARGIN, constants.MAX_HEIGHT - constants.MARGIN, constants.MARGIN),
				},
			},
		],
		apple: {
			fillColor: constants.COLOR.COLOR_APPLE,
			position: {
				x: getRandomIntMultiple(constants.MARGIN, constants.MAX_WIDTH - constants.MARGIN, constants.MARGIN),
				y: getRandomIntMultiple(constants.MARGIN, constants.MAX_HEIGHT - constants.MARGIN, constants.MARGIN),
			},
		},
	}

	function main() {
		const bodyElement = document.querySelector("body");
		const canvas = createNewElement("canvas", { width: constants.MAX_WIDTH, height: constants.MAX_HEIGHT, });

		// Initial page / element styling
		document.title = "Snake";
		bodyElement.style.backgroundColor = "black";
		bodyElement.innerHTML = "";
		bodyElement.insertAdjacentElement("beforeend", canvas);
		constants.CONTEXT = canvas.getContext("2d");

		// User input listener
		document.addEventListener("keydown", handleInput);

		window.addEventListener("resize", () => {
			canvas.width = constants.MAX_WIDTH;
			canvas.height = constants.MAX_HEIGHT;
		});

		// Initial animation start
		state.animationFrameId = requestAnimationFrame(animate);
	}

	function handleInput(event) {
		const input = event.code.toLowerCase();

		if (input === "space") {
			// Handle the space key for pausing/resuming
			const { MARGIN } = constants;

			// If there isn't a frame id, it's either because the snake died or because we simply paused using the spacebar
			// If the snake has died we give it a new random position, resume either way
			if (state.animationFrameId === null) {
				if (!state.isSnakeAlive) {
					state.isSnakeAlive = true;
					objects.snakeBody = [
						{
							fillColor: "green",
							position: {
								x: getRandomIntMultiple(MARGIN, constants.MAX_WIDTH - MARGIN, MARGIN),
								y: getRandomIntMultiple(MARGIN, constants.MAX_HEIGHT - MARGIN, MARGIN),
							},
						},
					];
				}
				resumeAnimation();
			} else {
				pauseAnimation();
			}
		} else if (input.includes("arrow")) {
			// Handle arrow keys for movement
			const direction = input.replace("arrow", "");

			// Keep track of all possible directions their opposites
			const oppositeDirection = {
				left: "right",
				right: "left",
				up: "down",
				down: "up",
			};

			// Check if the key is an arrow key and if the direction change is valid
			if (["left", "right", "up", "down"].includes(direction) && !(objects.snakeBody.length > 1 && oppositeDirection[direction] === state.lastDirection)) {
				state.lastDirection = direction;
			}
		}
	}

	function animate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - state.lastTime;
		const { FRAME_DELAY, CONTEXT } = constants;

		if (timeElapsed > FRAME_DELAY) {
			// Redraw the canvas background
			CONTEXT.fillStyle = "black";
			CONTEXT.beginPath();
			CONTEXT.fillRect(0, 0, constants.MAX_WIDTH, constants.MAX_HEIGHT);
			CONTEXT.closePath();

			// Draw the apple
			canvasDraw([objects.apple]);

			// Check if the snake collided with itself or the apple
			// Move the snake body if it didn't collide with itself
			if (!checkCollision()) updateMovement();

			// Draw the snake body
			canvasDraw(objects.snakeBody);

			// Update the last time to the current time
			state.lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (state.animationFrameId !== null) state.animationFrameId = requestAnimationFrame(animate);
	}

	function canvasDraw(object) {
		for (const subObject of object) {
			const { position: { x, y }, fillColor } = subObject;
			const { MARGIN, CONTEXT } = constants;

			CONTEXT.fillStyle = fillColor;
			CONTEXT.beginPath();
			CONTEXT.fillRect(x - MARGIN / 2, y - MARGIN / 2, MARGIN, MARGIN);
			CONTEXT.closePath();
		}
	}

	function updateMovement() {
		const head = objects.snakeBody[0]; // Head is always the first element in snakeBody
		const { MARGIN } = constants;

		// Move the rest of the body: each part follows the position of the part ahead of it
		for (let i = objects.snakeBody.length - 1; i > 0; i--) {
			const currentPart = objects.snakeBody[i];
			const previousPart = objects.snakeBody[i - 1];

			// Move the current part to the position of the previous part
			currentPart.position = { ...previousPart.position };
		}

		// Move the head based on the last direction
		switch (state.lastDirection) {
			case "left":
				head.position.x -= MARGIN;
				break;
			case "up":
				head.position.y -= MARGIN;
				break;
			case "down":
				head.position.y += MARGIN;
				break;
			case "right":
				head.position.x += MARGIN;
				break;
			default:
				break;
		}

		// Check for bounds (wrap the snake around)
		for (const axis of ["x", "y"]) {
			const comparison = axis === "x" ? constants.MAX_WIDTH : constants.MAX_HEIGHT;
			if (head.position[axis] >= comparison) {
				head.position[axis] = 0;
			} else if (head.position[axis] < 0) {
				head.position[axis] = Math.round(comparison / MARGIN) * MARGIN - MARGIN;
			}
		}
	}

	function addNewBodyPart() {
		const lastPart = objects.snakeBody[objects.snakeBody.length - 1]; // Get the last segment
		const newPart = {
			fillColor: "green", // Color of the new body part
			position: { ...lastPart.position }, // Same position as the last part initially
		};

		// Add the new body part to the snake body array
		objects.snakeBody.push(newPart);
	}

	function checkCollision() {
		const head = objects.snakeBody[0]; // The head is always the first element in snakeBody

		// Check for collision with the snake body
		if (objects.snakeBody.some((bodyPart, index) => index > 0 && bodyPart.position.x === head.position.x && bodyPart.position.y === head.position.y)) {
			state.isSnakeAlive = false;
			state.deathTotal++;
			pauseAnimation();
			alert(
				"You died no bread alert.\n"+
				`Total Deaths: ${state.deathTotal}\n` +
				`Score this run: ${state.currentScore}\n` +
				`Highscore: ${state.highScore}`
			);
			state.currentScore = 0;
			return true; // Exit the function if we've found a collision with the body
		}

		// Check for collision with the apple
		if (head.position.x === objects.apple.position.x && head.position.y === objects.apple.position.y) {
			state.currentScore++;
			if (state.currentScore > state.highScore) state.highScore = state.currentScore;

			// Grow the snake by adding a new body part at the end
			addNewBodyPart();

			// Move apple to a new random position that isn't occupied by the snake body
			placeApple();
		}
		return false;
	}

	function placeApple() {
		// Grid-search subdivision algorithm to find new valid apple coördinates
		// We always subdivide our rectangles by 4, so you could say our grid-size is 4
		const { MARGIN } = constants;
		let rectangles = [{ x: 0, y: 0, width: constants.MAX_WIDTH, height: constants.MAX_HEIGHT }]; // Starting rectangle

		// Try placing the apple in subdivisions
		function findApplePosition(rectangles, maxDepth = 3) {
			let validRectangles = [];
			let attempts = 0;

			// Function to subdivide a rectangle
			function subdivide(rect) {
				let halfWidth = rect.width / 2;
				let halfHeight = rect.height / 2;
				return [
					{ x: rect.x, y: rect.y, width: halfWidth, height: halfHeight },
					{ x: rect.x + halfWidth, y: rect.y, width: halfWidth, height: halfHeight },
					{ x: rect.x, y: rect.y + halfHeight, width: halfWidth, height: halfHeight },
					{ x: rect.x + halfWidth, y: rect.y + halfHeight, width: halfWidth, height: halfHeight },
				];
			}

			// Function to check if the rectangle contains a valid apple position
			function isValidRectangle(rect) {
				// Check if this area overlaps with any part of the snake
				return !objects.snakeBody.some((bodyPart) => {
					isInRange(bodyPart.position.x, rect.x, rect.width) &&
					isInRange(bodyPart.position.y, rect.y, rect.height);
				});
			}

			while (attempts < maxDepth) {
				let newRectangles = [];
				let blockedCount = 0;

				// The first subdivision, because we need a minimum of 4 rectangles:
				for (const rect of rectangles) {
					if (isValidRectangle(rect)) {
						validRectangles.push(rect);
					} else {
						blockedCount++;
					}
				}

				if (blockedCount >= rectangles.length * 0.75) {
					// More than 75% blocked, subdivide the areas
					for (const rect of rectangles) {
						newRectangles.push(subdivide(rect));
					}
				}

				if (validRectangles.length > 0) {
					// Pick a random valid rectangle
					const chosenRect = validRectangles[Math.floor(Math.random() * validRectangles.length)];
					objects.apple.position.x = getRandomIntMultiple(chosenRect.x + MARGIN, chosenRect.width - MARGIN, MARGIN);
					objects.apple.position.y = getRandomIntMultiple(chosenRect.y + MARGIN, chosenRect.height - MARGIN, MARGIN);
					return;
				}

				rectangles = newRectangles; // Try again with the new subdivisions
				attempts++;
			}

			// Fallback if no position is found
			objects.apple.position.x = Math.round(constants.MAX_WIDTH / 2 / MARGIN) * MARGIN;
			objects.apple.position.y = Math.round(constants.MAX_HEIGHT / 2 / MARGIN) * MARGIN;
		}

		findApplePosition(rectangles);
	}

	function pauseAnimation() {
		cancelAnimationFrame(state.animationFrameId);
		state.animationFrameId = null;
	}

	function resumeAnimation() {
		state.animationFrameId = requestAnimationFrame(animate);
	}

	return {
		run: main,
	};
})();
