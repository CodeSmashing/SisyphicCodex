const snake = (function () {
	let { clientWidth: maxWidth, clientHeight: maxHeight } = document.body;
	let context;
	let animationFrameId = null;
	let lastTime = 0;

	const snakeConstants = {
		// Constants for movement
		MARGIN: 20,
		LAST_DIRECTION: "left",

		// Misc.
		FRAME_DELAY: 200, // In milliseconds
		MAX_ITERATIONS: 5,

		// Game related constants
		GAME: {
			IS_SNAKE_ALIVE: true,
			HIGH_SCORE: 0,
			CURRENT_SCORE: 0,
			DEATH_TOTAL: 0,
		},

		// Constants for color
		COLOR: {
			COLOR_RANGE: { MIN: 0, MAX: 255 },
			COLOR_SNAKE: "green",
			COLOR_APPLE: "red",
		},
	};

	let snakeBody = [
		{
			fillColor: "green",
			position: {
				x: getRandomIntMultiple(snakeConstants.MARGIN, maxWidth - snakeConstants.MARGIN, snakeConstants.MARGIN),
				y: getRandomIntMultiple(snakeConstants.MARGIN, maxHeight - snakeConstants.MARGIN, snakeConstants.MARGIN),
			},
		},
	];

	let apple = {
		fillColor: "red",
		position: {
			x: getRandomIntMultiple(snakeConstants.MARGIN, maxWidth - snakeConstants.MARGIN, snakeConstants.MARGIN),
			y: getRandomIntMultiple(snakeConstants.MARGIN, maxHeight - snakeConstants.MARGIN, snakeConstants.MARGIN),
		},
	};

	function main() {
		const bodyElement = document.querySelector("body");
		bodyElement.innerHTML = "";
		bodyElement.style.backgroundColor = "black";

		// Create elements like the canvas or option-menu and set properties
		const canvas = createNewElement("canvas", { width: maxWidth, height: maxHeight });
		context = canvas.getContext("2d");
		bodyElement.insertAdjacentElement("beforeend", canvas);

		// User input listener
		document.addEventListener("keydown", handleInput);

		window.addEventListener("resize", () => {
			maxWidth = document.body.clientWidth;
			maxHeight = document.body.clientHeight;
			canvas.width = maxWidth;
			canvas.height = maxHeight;
		});

		animationFrameId = requestAnimationFrame(snakeAnimate);
	}

	function handleInput(event) {
		const input = event.code.toLowerCase();

		// Handle the space key for pausing/resuming
		if (input === "space") {
			// If there isn't a frame id, it's either because the snake died or because we simply paused using the spacebar
			// If the snake has died we give it a new random position, resume either way
			if (animationFrameId === null) {
				if (!snakeConstants.IS_SNAKE_ALIVE) {
					const { MARGIN } = snakeConstants;
					snakeConstants.IS_SNAKE_ALIVE = true;
					snakeBody = [
						{
							fillColor: "green",
							position: {
								x: getRandomIntMultiple(MARGIN, maxWidth - MARGIN, MARGIN),
								y: getRandomIntMultiple(MARGIN, maxHeight - MARGIN, MARGIN),
							},
						},
					];
				}
				resumeAnimation();
			} else {
				pauseAnimation();
			}
		} else {
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
			if (["left", "right", "up", "down"].includes(direction) && !(snakeBody.length > 1 && oppositeDirection[direction] === snakeConstants.LAST_DIRECTION)) {
				snakeConstants.LAST_DIRECTION = direction;
			}
		}
	}

	// To animate the snake body array
	function snakeAnimate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - lastTime;

		if (timeElapsed > snakeConstants.FRAME_DELAY) {
			// Redraw the canvas background
			context.fillStyle = "black";
			context.beginPath();
			context.fillRect(0, 0, maxWidth, maxHeight);
			context.closePath();

			// Draw the apple
			snakeDraw(apple);

			// Check if the snake collided with itself or the apple
			// Move the snake body if it didn't collide with itself
			if (!checkCollision()) snakeMovement();

			// Draw the snake body
			snakeBody.forEach((bodyPart) => {
				snakeDraw(bodyPart);
			});

			// Update the last time to the current time
			lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (animationFrameId !== null) animationFrameId = requestAnimationFrame(snakeAnimate);
	}

	// To draw game objects
	function snakeDraw(object) {
		const { x, y } = object.position;
		const { MARGIN } = snakeConstants;

		context.fillStyle = object.fillColor;
		context.beginPath();
		context.fillRect(x - MARGIN / 2, y - MARGIN / 2, MARGIN, MARGIN);
		context.closePath();
	}

	// To move the snake and it's body
	function snakeMovement() {
		const head = snakeBody[0]; // Head is always the first element in snakeBody
		const { MARGIN } = snakeConstants;

		// Move the rest of the body: each part follows the position of the part ahead of it
		for (let i = snakeBody.length - 1; i > 0; i--) {
			const currentPart = snakeBody[i];
			const previousPart = snakeBody[i - 1];

			// Move the current part to the position of the previous part
			currentPart.position = { ...previousPart.position };
		}

		// Move the head based on the LAST_DIRECTION
		switch (snakeConstants.LAST_DIRECTION) {
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
		for (const [axis] of Object.entries(head.position)) {
			const comparison = axis === "x" ? maxWidth : maxHeight;
			if (head.position[axis] >= comparison) {
				head.position[axis] = 0;
			} else if (head.position[axis] < 0) {
				head.position[axis] = Math.round(comparison / MARGIN) * MARGIN - MARGIN;
			}
		}
	}

	// To add new snake bodyparts
	function addNewBodyPart() {
		const lastPart = snakeBody[snakeBody.length - 1]; // Get the last segment
		const newPart = {
			fillColor: "green", // Color of the new body part
			position: { ...lastPart.position }, // Same position as the last part initially
		};

		// Add the new body part to the snake body array
		snakeBody.push(newPart);
	}

	// To check collisions like snake vs apple or snake vs snake
	function checkCollision() {
		const head = snakeBody[0]; // The head is always the first element in snakeBody
		let { GAME } = snakeConstants;

		// Check for collision with the snake body
		if (snakeBody.some((bodyPart, index) => index > 0 && bodyPart.position.x === head.position.x && bodyPart.position.y === head.position.y)) {
			snakeConstants.IS_SNAKE_ALIVE = false;
			GAME.DEATH_TOTAL++;
			pauseAnimation();
			alert(
				"You died no bread alert.\n"+
				`Total Deaths: ${GAME.DEATH_TOTAL}\n` +
				`Score this run: ${GAME.CURRENT_SCORE}\n` +
				`Highscore: ${GAME.HIGH_SCORE}`
			);
			GAME.CURRENT_SCORE = 0;
			return true; // Exit the function if we've found a collision with the body
		}

		// Check for collision with the apple
		if (head.position.x === apple.position.x && head.position.y === apple.position.y) {
			GAME.CURRENT_SCORE++;
			if (GAME.CURRENT_SCORE > GAME.HIGH_SCORE) GAME.HIGH_SCORE = GAME.CURRENT_SCORE;

			// Grow the snake by adding a new body part at the end
			addNewBodyPart();

			// Move apple to a new random position that isn't occupied by the snake body
			placeApple();
		}
		return false;
	}

	// To place the apple is valid coördinates, uses a grid-search subdivision algorithm
	function placeApple() {
		// We always subdivide our rectangles by 4, so you could say our grid-size is 4
		let rectangles = [{ x: 0, y: 0, width: maxWidth, height: maxHeight }]; // Starting rectangle

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
				return !snakeBody.some((bodyPart) => {
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
					apple.position.x = getRandomIntMultiple(chosenRect.x, chosenRect.width, snakeConstants.MARGIN);
					apple.position.y = getRandomIntMultiple(chosenRect.y, chosenRect.height, snakeConstants.MARGIN);
					return;
				}

				rectangles = newRectangles; // Try again with the new subdivisions
				attempts++;
			}

			// Fallback if no position is found
			apple.position.x = Math.round(maxWidth / 2 / snakeConstants.MARGIN) * snakeConstants.MARGIN;
			apple.position.y = Math.round(maxHeight / 2 / snakeConstants.MARGIN) * snakeConstants.MARGIN;
		}

		findApplePosition(rectangles);
	}

	// To "pause" the animation
	function pauseAnimation() {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// To "resume" the animation
	function resumeAnimation() {
		animationFrameId = requestAnimationFrame(snakeAnimate);
	}

	return {
		run: main,
	};
})();
