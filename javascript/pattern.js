// Using IIFE to avoid name clashes between files
// export function tag(tagName, text) {}
const patterns = (function () {
	let { clientWidth: maxWidth, clientHeight: maxHeight } = document.body;
	let context;
	let animationFrameId = null;
	let patternArray = [];
	let lastTime = 0;

	const patternConstants = {
		// Constants for movement
		MARGIN: 5,
		VARIANCE: 0.5,
		ORIGIN: {
			CENTER: {
				MARGIN: 200,
				get X() {
					return maxWidth / 2 + getRandomInt(-this.MARGIN, this.MARGIN);
				},
				get Y() {
					return maxHeight / 2 + getRandomInt(-this.MARGIN, this.MARGIN);
				},
			},
			FULL: {
				get X() {
					return getRandomInt(0, maxWidth);
				},
				get Y() {
					return getRandomInt(0, maxHeight);
				},
			},
			CURSOR: {
				MARGIN: 100,
				TARGET_X: 0,
				TARGET_Y: 0,
				get X() {
					return Math.abs(this.TARGET_X - maxWidth + getRandomInt(-this.MARGIN, this.MARGIN));
				},
				get Y() {
					return Math.abs(this.TARGET_Y - maxHeight + getRandomInt(-this.MARGIN, this.MARGIN));
				},
			},
		},

		// Misc.
		PATTERN_COUNT: 1000,
		WIDTH: 3,
		MAX_ITERATIONS: 8,
		FRAME_DELAY: 0, // In milliseconds
		ORIGIN_CHOICE: "CENTER",

		// Constants for color
		COLOR_RANGE: { MIN: 0, MAX: 255 },
		FADE: {
			AFTER_ANIMATED: {
				BOOL: true,
				COLOR: "black",
				STRENGTH: 0.02,
			},
			AFTER_TARGET: {
				BOOL: false,
				COLOR: "black",
				STRENGTH: 0.02,
			},
			AFTER_MAX_ITERATION: {
				BOOL: false,
				COLOR: "black",
				STRENGTH: 0.02,
			},
		},
		HITBOX: {
			OF_TARGET: {
				BOOL: false,
				SIZE_X: 20,
				SIZE_Y: 20,
				COLOR: "red",
				STRENGTH: 1,
			},
			OF_POS: {
				BOOL: false,
				SIZE_X: 10,
				SIZE_Y: 10,
				COLOR: "green",
				STRENGTH: 0.5,
			},
		},
	};

	function main() {
		const bodyElement = document.querySelector("body");
		bodyElement.innerHTML = "";
		bodyElement.style.backgroundColor = "black";

		// Create elements like the canvas or option-menu and set properties
		const canvas = createNewElement("canvas", { width: maxWidth, height: maxHeight });
		const optionMenuArticle = createNewElement("article", { id: "patternMenu" });
		const optionMenuForm = createNewElement("form", {
			classList: ["hide"],
			onsubmit: (event) => {
				formValidation(event);
			},
		});
		const optionMenuToggle = createNewElement("button", {
			classList: ["toggle"],
			type: "button",
			textContent: "| | |",
			listeners: [
				{
					type: "click",
					get action() {
						return optionMenuToggle.classList.toggle("hide");
					},
				},
				{
					type: "click",
					get action() {
						return optionMenuForm.classList.toggle("hide");
					},
				},
			],
		});

		context = canvas.getContext("2d");
		bodyElement.insertAdjacentElement("beforeend", canvas);
		optionMenuArticle.insertAdjacentElement("beforeend", optionMenuToggle);

		// The input fields and labels
		const setMenuFormData = (object, layer = 0, parents = []) => {
			for (const [key, value] of Object.entries(object)) {
				if (layer === 0) optionMenuForm.appendChild(createNewElement("label", { classList: ["title"], textContent: key }));

				if (typeof value === "object") {
					const newParents = [...parents, key];
					setMenuFormData(value, layer + 1, newParents);
				} else {
					const parentString = [...parents, key].join(" ").trim();
					let newInput = createNewElement("input", { type: typeof value, value: value, name: parentString, step: 0.01 });
					let newLabel = document.createElement("label");

					if (layer !== 0) {
						// We slice here because the title already contains the root object's name
						const parentString = [...parents.slice(1), key].join(" ").trim();
						let spacer = createNewElement("span", { classList: ["spacer"] });
						let span = createNewElement("span", { textContent: parentString });

						newLabel.appendChild(spacer);
						newLabel.appendChild(span);
					}

					newLabel.appendChild(newInput);
					optionMenuForm.appendChild(newLabel);
				}
			}
		};

		setMenuFormData(patternConstants);

		let newInput = createNewElement("input", { type: "submit", value: "Submit new constants.", name: "patternMenu" });
		optionMenuForm.appendChild(newInput);
		optionMenuArticle.appendChild(optionMenuForm);
		bodyElement.insertAdjacentElement("beforeend", optionMenuArticle);

		function shouldShowMenu(event) {
			const { clientX: mouseX, clientY: mouseY } = event;
			const BOUNDING_RECT = optionMenuForm.getBoundingClientRect();

			// Detect if hovering in menu
			const isInMenu =
				(mouseX >= BOUNDING_RECT.left) &&
				(mouseX <= BOUNDING_RECT.right) &&
				(mouseY >= BOUNDING_RECT.top) &&
				(mouseY <= BOUNDING_RECT.bottom);
	
			return isInMenu;
		}

		function updateMenuVisibility(event) {
			const shouldShow = shouldShowMenu(event);

			// Hide or show accordingly
			if (!shouldShow) {
				optionMenuToggle.classList.remove("hide");
				optionMenuForm.classList.add("hide");
			}
		}

		function cursorUpdate(event) {
			debounce(updateMenuVisibility(event), 20);
			if (patternConstants.ORIGIN_CHOICE === "CURSOR") {
				const { clientX: mouseX, clientY: mouseY } = event;
				patternConstants.ORIGIN.CURSOR.TARGET_X = mouseX;
				patternConstants.ORIGIN.CURSOR.TARGET_Y = mouseY;
				patternArray.forEach((pattern) => {
					pattern.position.x.target = mouseX;
					pattern.position.y.target = mouseY;
				});
			}
		}

		// Initialize the pattern array with randomised patterns
		patternArray = Array.from({ length: patternConstants.PATTERN_COUNT }, () => {
			return createPatternBud();
		});

		// User input listener for pause/resume functionality
		document.addEventListener("keydown", (event) => {
			if (event.code.toLowerCase() == "space") {
				if (animationFrameId === null) {
					resumeAnimation();
				} else {
					pauseAnimation();
				}
			}
		});

		// Add event listener for showing the menu (with debounce)
		document.addEventListener("mousemove", cursorUpdate);

		window.addEventListener("resize", () => {
			maxWidth = document.body.clientWidth;
			maxHeight = document.body.clientHeight;
			canvas.width = maxWidth;
			canvas.height = maxHeight;
		});

		// Start the initial pattern animation
		animationFrameId = requestAnimationFrame(patternAnimate);
	}

	// To animate the entire pattern array
	function patternAnimate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - lastTime;

		if (timeElapsed > patternConstants.FRAME_DELAY) {
			patternArray.forEach((pattern, index) => {
				patternDraw(pattern, index);
				pattern.frameCountAnimation++;
			});

			// To fade all the drawn patterns after each one is animated
			if (patternConstants.FADE.AFTER_ANIMATED.BOOL) drawColoredShape(0, 0, patternConstants.FADE.AFTER_ANIMATED);

			// Update the last time to the current time
			lastTime = currentTime;
		}

		// Request the next animation frame
		animationFrameId = requestAnimationFrame(patternAnimate);
	}

	// To draw non-essential shapes like the fade and hitboxes
	function drawColoredShape(x, y, source) {
		const { COLOR, STRENGTH, SIZE_X = null, SIZE_Y = null } = source;
		// Convert color name to RGB
		context.fillStyle = COLOR;
		let rgbColor = context.fillStyle;

		// Remove hashtag if present
		rgbColor = rgbColor.replace("#", "");

		// Parse RGB values
		const r = parseInt(rgbColor.slice(0, 2), 16);
		const g = parseInt(rgbColor.slice(2, 4), 16);
		const b = parseInt(rgbColor.slice(4, 6), 16);

		context.beginPath();
		context.fillStyle = `rgba(${r}, ${g}, ${b}, ${STRENGTH})`;
		context.fillRect(x - SIZE_X / 2, y - SIZE_Y / 2, SIZE_X ?? maxWidth, SIZE_Y ?? maxHeight);
		context.closePath();
	}

	// To draw individual patterns
	function patternDraw(pattern, index) {
		const { x, y } = pattern.position;
		// Styling and placement of pattern
		context.strokeStyle = adjustColor(pattern.fillColor, patternConstants.COLOR_RANGE.MIN, patternConstants.COLOR_RANGE.MAX);
		context.lineWidth = patternConstants.WIDTH;
		context.beginPath();
		context.moveTo(x.current, y.current);
		adjustMovement(pattern, index);

		context.lineTo(x.current, y.current);
		context.stroke();
		context.closePath();

		// Hitbox pattern
		if (patternConstants.HITBOX.OF_POS.BOOL) drawColoredShape(x.current, y.current, patternConstants.HITBOX.OF_POS);

		// Hitbox target
		if (patternConstants.HITBOX.OF_TARGET.BOOL) drawColoredShape(x.target, y.target, patternConstants.HITBOX.OF_TARGET);

		if (isInRange(x.current, x.target - patternConstants.MARGIN * 2, x.target + patternConstants.MARGIN * 2)) {
			if (isInRange(y.current, y.target - patternConstants.MARGIN * 2, y.target + patternConstants.MARGIN * 2)) {
				console.log("Target destination reached. Starting a new pattern.");
				if (patternConstants.FADE.AFTER_TARGET.BOOL) drawColoredShape(0, 0, patternConstants.FADE.AFTER_TARGET);
				patternArray.splice(index, 1, createPatternBud());
			}
		}
	}

	// To adjust pattern positions
	function adjustMovement(pattern, index, iteration = 0) {
		const excludedMargins = [],
			{ position } = pattern,
			chosenMargins = { x: 0, y: 0 },
			newPosition = { x: 0, y: 0 },
			marginValues = [-patternConstants.MARGIN, 0, patternConstants.MARGIN];

		// To pick random margins that we haven't excluded
		for (let i = 0; i < patternConstants.MAX_ITERATIONS; i++) {
			for (const [axis, { current, target }] of Object.entries({ x: position.x, y: position.y })) {
				chosenMargins[axis] = getRandomBool(patternConstants.VARIANCE)
					? getRandomArrayElement(marginValues)
					: marginValues.reduce((best, margin) => {
							// Try to find the optimal next step
							const addition = Math.abs(target - (current + margin));
							const subtraction = Math.abs(target - (current - margin));
							const optimal = Math.abs(target - (current + best));

							if (addition < subtraction && addition < optimal) {
								return margin;
							} else if (subtraction < optimal) {
								return -margin;
							}
							return best;
					  }, 0);
			}

			if (!excludedMargins.some((margins) => margins.x === chosenMargins.x && margins.y === chosenMargins.y)) {
				break;
			}
		}

		newPosition.x = position.x.current + chosenMargins.x;
		newPosition.y = position.y.current + chosenMargins.y;

		// Check to see if new position overlaps with known positions
		const isPositionKnown = position.known.some((oldPair, oldPairIndex) => {
			const isExactMatch = oldPair.some((oldPosition) => oldPosition.x === newPosition.x && oldPosition.y === newPosition.y);
			if (isExactMatch) return true;

			// If centers are a match
			if (oldPairIndex !== position.known.length - 1) {
				const oldPairCenter = {
					x: oldPair[1].x + (oldPair[0].x - oldPair[1].x) / 2,
					y: oldPair[1].y + (oldPair[0].y - oldPair[1].y) / 2,
				};

				const newPositionCenter = {
					x: newPosition.x - chosenMargins.x / 2,
					y: newPosition.y - chosenMargins.y / 2,
				};

				return newPositionCenter == oldPairCenter.x && newPositionCenter == oldPairCenter.y;
			}
			return false;
		});

		if (isPositionKnown) {
			excludedMargins.push(chosenMargins);

			if (iteration < patternConstants.MAX_ITERATIONS) {
				adjustMovement(pattern, index, iteration + 1);
			} else {
				console.log("Maximum iterations reached. Starting a new pattern.");
				if (patternConstants.FADE.AFTER_MAX_ITERATION.BOOL) drawColoredShape(0, 0, patternConstants.FADE.AFTER_MAX_ITERATION);
				patternArray.splice(index, 1, createPatternBud());
			}
		} else {
			position.x.current = newPosition.x;
			position.y.current = newPosition.y;
			position.known[position.known.length - 1].push({ x: newPosition.x, y: newPosition.y });
			position.known.push([{ x: newPosition.x, y: newPosition.y }]);
		}
	}

	// To create new pattern buds and return their associated objects
	function createPatternBud() {
		let patternBud = {
			fillColor: getRandomColor(patternConstants.COLOR_RANGE.MIN, patternConstants.COLOR_RANGE.MAX),
			requestedAnimation: undefined,
			frameCountAnimation: 0,
			position: {
				x: {
					target: patternConstants.ORIGIN[patternConstants.ORIGIN_CHOICE].TARGET_X ?? getRandomInt(0, maxWidth),
					current: patternConstants.ORIGIN[patternConstants.ORIGIN_CHOICE].X,
				},
				y: {
					target: patternConstants.ORIGIN[patternConstants.ORIGIN_CHOICE].TARGET_Y ?? getRandomInt(0, maxHeight),
					current: patternConstants.ORIGIN[patternConstants.ORIGIN_CHOICE].Y,
				},
				known: [],
			},
		};
		patternBud.position.known.push([{ x: patternBud.position.x.current, y: patternBud.position.y.current }]);
		return patternBud;
	}

	// To change constants depending on user input
	function updateConstants(userSubmission) {
		const wasPaused = animationFrameId;
		pauseAnimation();

		for (const input of userSubmission.elements) {
			if (input.type !== "submit") {
				const keys = input.name.split(" ");

				switch (input.attributes.type.value) {
					case "number":
						setNestedProperty(patternConstants, keys, Number(input.value));
						break;
					case "boolean":
						setNestedProperty(patternConstants, keys, input.value.toLowerCase() === "true");
						break;
					case "string":
						setNestedProperty(patternConstants, keys, String(input.value));
						break;
					default:
						console.log("We haven't considered that type yet.");
						break;
				}
			}
		}

		// Initialize the pattern array with newly randomised patterns
		patternArray = Array.from({ length: patternConstants.PATTERN_COUNT }, () => {
			return createPatternBud();
		});

		// Request the next frame if we have a valid ID
		if (!(wasPaused === null)) animationFrameId = requestAnimationFrame(patternAnimate);
	}

	// To "pause" the animation
	function pauseAnimation() {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// To "resume" the animation
	function resumeAnimation() {
		animationFrameId = requestAnimationFrame(patternAnimate);
	}

	return {
		run: main,
		update: updateConstants,
	};
})();

/**
 * Ideas:
 *	You start from the center of the canvas and have one "tendril" expand outwards.
 *	Every few moves we create a new branch which will act the same way.
 *	Every moving "tendril" moves AWAY from the center and tries to cover as much area as it can.
 *
 *	Could be cool to work with a more elaborate "hot" and "cold" system instead of random variance
 *
 *	Keep an attribute where we calculate once the total amount of optimal steps to take to the target from the starting position (for a counter or something).
 *
 *	Could give individual patterns more then one target if we wish to expand what a single pattern bud can do.
 */
