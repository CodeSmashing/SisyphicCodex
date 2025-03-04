const pattern = (function () {
	// Properties that hardly change (exceptions being getters and form submission)
	const constants = {
		// Related to movement
		MARGIN: 1,
		VARIANCE: 0.5,
		ORIGIN: {
			CENTER: {
				MARGIN: 200,
				get X() {
					return constants.MAX_WIDTH / 2 + getRandomInt(-this.MARGIN, this.MARGIN);
				},
				get Y() {
					return constants.MAX_HEIGHT / 2 + getRandomInt(-this.MARGIN, this.MARGIN);
				},
			},
			FULL: {
				get X() {
					return getRandomInt(0, constants.MAX_WIDTH);
				},
				get Y() {
					return getRandomInt(0, constants.MAX_HEIGHT);
				},
			},
			CURSOR: {
				MARGIN: 100,
				TARGET_X: 0,
				TARGET_Y: 0,
				get X() {
					return Math.abs(this.TARGET_X - constants.MAX_WIDTH + getRandomInt(-this.MARGIN, this.MARGIN));
				},
				get Y() {
					return Math.abs(this.TARGET_Y - constants.MAX_HEIGHT + getRandomInt(-this.MARGIN, this.MARGIN));
				},
			},
		},

		// Related to color
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
				BOOL: true,
				SIZE_X: 50,
				SIZE_Y: 50,
				COLOR: "green",
				STRENGTH: 0.5,
			},
			OF_PAIR_CENTER: {
				BOOL: false,
				SIZE_X: 10,
				SIZE_Y: 10,
				COLOR: "yellow",
				STRENGTH: 0.5,
			},
		},
		CONTEXT: null,

		// Misc. properties
		PATTERN_COUNT: 100,
		PATTERN_WIDTH: 3,
		get MAX_WIDTH() {
			return document.querySelector("body main").clientWidth;
		},
		get MAX_HEIGHT() {
			return document.querySelector("body main").clientHeight;
		},
		MAX_ITERATIONS: 8,
		FRAME_DELAY: 20, // In milliseconds
		ORIGIN_CHOICE: "CENTER",
	};

	// Properties that keep track of the game's current state
	const state = {
		animationFrameId: null,
		lastTime: 0,
	};

	// "Game-world" objects
	const objects = {
		patternArray: [],
	};

	function main() {
		const mainElement = document.querySelector("body main");
		const asideElement = mainElement.querySelector("aside");
		const anchorMenu = asideElement.querySelector("ul");
		const subMainElement = mainElement.querySelector("main");
		const canvas = createNewElement("canvas", { width: constants.MAX_WIDTH, height: constants.MAX_HEIGHT });
		const optionMenuArticle = createNewElement("article", { id: "pattern-article" });
		const optionMenuForm = createNewElement("form", {
			id: "pattern-menu",
			classList: ["hide"],
			onsubmit: "formInteraction(event);",
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

		// Initial page / element styling
		document.title = "Patterns";
		mainElement.classList.add("game");
		anchorMenu.style.display = "none";
		subMainElement.classList.add("pattern");
		subMainElement.style.backgroundColor = "black";
		subMainElement.replaceChildren();
		subMainElement.insertAdjacentElement("beforeend", canvas);
		constants.CONTEXT = canvas.getContext("2d");
		optionMenuArticle.insertAdjacentElement("beforeend", optionMenuToggle);

		// The input fields and their labels
		const setMenuFormData = (object, layer = 0, parents = []) => {
			for (const [key, value] of Object.entries(object)) {
				if (layer === 0) optionMenuForm.appendChild(createNewElement("label", { classList: ["title"], textContent: key }));

				if (typeof value === "object") {
					const newParents = [...parents, key];
					setMenuFormData(value, layer + 1, newParents);
				} else {
					const parentString = [...parents, key].join(" ").trim();
					let newInput = createNewElement("input", { type: typeof value, value, name: parentString, step: 0.01 });
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

		setMenuFormData(constants);

		const backButton = createNewElement("button", {
			classList: ["return", "-game"],
			children: [createNewElement("img", { src: "../images/returnArrow.png" })],
			listeners: [
				{
					type: "click",
					get action() {
						return leaveGame();
					},
				},
			],
		});
		asideElement.insertAdjacentElement("afterbegin", backButton);
		const newInput = createNewElement("input", { type: "submit", value: "Submit new constants.", name: "pattern-menu" });
		optionMenuForm.appendChild(newInput);
		optionMenuArticle.appendChild(optionMenuForm);
		subMainElement.insertAdjacentElement("beforeend", optionMenuArticle);

		// Initialize the pattern array with randomised patterns
		objects.patternArray = Array.from({ length: constants.PATTERN_COUNT }, () => {
			return createPattern();
		});

		// User input listeners
		document.addEventListener("keydown", handleInput);
		document.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("resize", setCanvasProperties);

		// Initial animation start
		state.animationFrameId = requestAnimationFrame(animate);

		function leaveGame() {
			pauseAnimation();
			const gameMenuArray = fetch("htmlStorage.json")
				.then((response) => response.json())
				.then((data) => {
					return data["games"]["menu"];
				})
				.catch((error) => console.error("Error:", error));

			gameMenuArray.then((results) => {
				document.title = "Games";
				mainElement.classList.remove("game");
				anchorMenu.style.display = "flex";
				asideElement.removeChild(backButton);
				subMainElement.classList.remove("pattern");
				subMainElement.style.backgroundColor = "var(--background-main)";
				subMainElement.replaceChildren();
				subMainElement.innerHTML = results.join("");

				document.removeEventListener("keydown", handleInput);
				document.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("resize", setCanvasProperties);

				state.lastTime = 0;
				objects.patternArray = [];
			});
		}
	}

	function setCanvasProperties() {
		canvas.width = constants.MAX_WIDTH;
		canvas.height = constants.MAX_HEIGHT;
	}

	function animate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - state.lastTime;

		if (timeElapsed > constants.FRAME_DELAY) {
			canvasDraw();

			// To fade all the drawn patterns after each one is animated
			if (constants.FADE.AFTER_ANIMATED.BOOL) drawColoredShape(0, 0, constants.FADE.AFTER_ANIMATED);

			// Update the last time to the current time
			state.lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (state.animationFrameId !== null) state.animationFrameId = requestAnimationFrame(animate);
	}

	function handleInput(event) {
		const input = event.code.toLowerCase();

		// Handle the space key for pausing/resuming
		if (input !== "space") return;
		state.animationFrameId === null ? resumeAnimation() : pauseAnimation();
	}

	function handleMouseMove(event) {
		const optionMenuForm = document.querySelector("body article form");
		const optionMenuToggle = document.querySelector("body article button");

		debounce(updateMenuVisibility(event), 20);

		if (constants.ORIGIN_CHOICE !== "CURSOR") return;
		const { clientX: mouseX, clientY: mouseY } = event;
		constants.ORIGIN.CURSOR.TARGET_X = mouseX;
		constants.ORIGIN.CURSOR.TARGET_Y = mouseY;

		for (const pattern of objects.patternArray) {
			pattern.position.x.target = mouseX;
			pattern.position.y.target = mouseY;
		}

		function updateMenuVisibility(event) {
			const shouldShow = shouldShowMenu(event);

			// Hide or show accordingly
			if (shouldShow) return;
			optionMenuToggle.classList.remove("hide");
			optionMenuForm.classList.add("hide");
		}

		function shouldShowMenu(event) {
			const { clientX: mouseX, clientY: mouseY } = event;
			const BOUNDING_RECT = optionMenuForm.getBoundingClientRect();

			// Detect if hovering in menu
			const isInMenu =
				mouseX >= BOUNDING_RECT.left &&
				mouseX <= BOUNDING_RECT.right &&
				mouseY >= BOUNDING_RECT.top &&
				mouseY <= BOUNDING_RECT.bottom;
	
			return isInMenu;
		}
	}

	// To draw non-essential shapes like fades and hitboxes
	function drawColoredShape(x, y, source) {
		const { COLOR, STRENGTH, SIZE_X = null, SIZE_Y = null } = source;
		const { CONTEXT } = constants;

		// Convert color name to RGB
		CONTEXT.fillStyle = COLOR;
		let rgbColor = CONTEXT.fillStyle;

		// Remove hashtag if present
		rgbColor = rgbColor.replace("#", "");

		// Parse RGB values
		const r = parseInt(rgbColor.slice(0, 2), 16);
		const g = parseInt(rgbColor.slice(2, 4), 16);
		const b = parseInt(rgbColor.slice(4, 6), 16);

		CONTEXT.beginPath();
		CONTEXT.fillStyle = `rgba(${r}, ${g}, ${b}, ${STRENGTH})`;
		CONTEXT.fillRect(
			x - SIZE_X / 2,
			y - SIZE_Y / 2,
			SIZE_X ?? constants.MAX_WIDTH,
			SIZE_Y ?? constants.MAX_HEIGHT
		);
		CONTEXT.closePath();
	}

	function canvasDraw() {
		const { CONTEXT, COLOR_RANGE, PATTERN_WIDTH, HITBOX, MARGIN, FADE } = constants;
		for (const [index, pattern] of objects.patternArray.entries()) {
			const { x, y } = pattern.position;

			// Styling and placement of pattern
			CONTEXT.strokeStyle = adjustColor(pattern.fillColor, COLOR_RANGE.MIN, COLOR_RANGE.MAX);
			CONTEXT.lineWidth = PATTERN_WIDTH;
			CONTEXT.beginPath();
			CONTEXT.moveTo(x.current, y.current);
			const chosenMargins = updateMovement(pattern, index);
			CONTEXT.lineTo(x.current, y.current);
			CONTEXT.stroke();
			CONTEXT.closePath();

			// Show hitbox of pattern and target
			if (typeof chosenMargins === "object" && HITBOX.OF_PAIR_CENTER.BOOL) drawColoredShape(x.current - chosenMargins.x / 2, y.current - chosenMargins.y / 2, HITBOX.OF_PAIR_CENTER);
			if (HITBOX.OF_POS.BOOL) drawColoredShape(x.current, y.current, HITBOX.OF_POS);
			if (HITBOX.OF_TARGET.BOOL) drawColoredShape(x.target, y.target, HITBOX.OF_TARGET);

			// Check if the pattern is in range of it's target
			if (!isInRange(x.current, x.target - MARGIN * 2, x.target + MARGIN * 2)) continue;
			if (!isInRange(y.current, y.target - MARGIN * 2, y.target + MARGIN * 2)) continue;

			// Replace pattern with a new one and fade the canvas if enabled
			// console.log("Target destination reached. Starting a new pattern.");
			objects.patternArray.splice(index, 1, createPattern());
			if (FADE.AFTER_TARGET.BOOL) drawColoredShape(0, 0, FADE.AFTER_TARGET);
		}
	}

	function updateMovement(pattern, index, iteration = 0) {
		const excludedMargins = [];
		const { position } = pattern;
		const { MARGIN, MAX_ITERATIONS, VARIANCE, FADE } = constants;
		const chosenMargins = { x: 0, y: 0 };
		const newPosition = { x: 0, y: 0 };
		const marginValues = [-MARGIN, 0, MARGIN];

		// To pick random margins that we haven't excluded
		for (let i = 0; i < MAX_ITERATIONS; i++) {
			for (const [axis, { current, target }] of Object.entries({ x: position.x, y: position.y })) {
				chosenMargins[axis] = getRandomBool(VARIANCE)
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

			if (!excludedMargins.some((margins) => margins.x === chosenMargins.x && margins.y === chosenMargins.y)) break;
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

			if (iteration < MAX_ITERATIONS) {
				return updateMovement(pattern, index, iteration + 1);
			} else {
				// Replace pattern with a new one and fade the canvas if enabled
				// console.log("Maximum iterations reached. Starting a new pattern.");
				objects.patternArray.splice(index, 1, createPattern());
				if (FADE.AFTER_MAX_ITERATION.BOOL) drawColoredShape(0, 0, FADE.AFTER_MAX_ITERATION);
			}
		} else {
			position.x.current = newPosition.x;
			position.y.current = newPosition.y;
			position.known[position.known.length - 1].push({ x: newPosition.x, y: newPosition.y });
			position.known.push([{ x: newPosition.x, y: newPosition.y }]);
			return chosenMargins;
		}
	}

	// To create new patterns, returns their associated objects
	function createPattern() {
		const { COLOR_RANGE, ORIGIN, ORIGIN_CHOICE } = constants;
		let patternBud = {
			fillColor: getRandomColor(COLOR_RANGE.MIN, COLOR_RANGE.MAX),
			requestedAnimation: undefined,
			position: {
				x: {
					target: ORIGIN[ORIGIN_CHOICE].TARGET_X ?? getRandomInt(0, constants.MAX_WIDTH),
					current: ORIGIN[ORIGIN_CHOICE].X,
				},
				y: {
					target: ORIGIN[ORIGIN_CHOICE].TARGET_Y ?? getRandomInt(0, constants.MAX_HEIGHT),
					current: ORIGIN[ORIGIN_CHOICE].Y,
				},
				known: [],
			},
		};
		patternBud.position.known.push([{ x: patternBud.position.x.current, y: patternBud.position.y.current }]);
		return patternBud;
	}

	// To change constants depending on user input
	function updateConstants(userSubmission) {
		const wasPaused = state.animationFrameId;
		pauseAnimation();

		for (const input of userSubmission.elements) {
			if (input.type === "submit") continue;
			const keys = input.name.split(" ");

			switch (input.attributes.type.value) {
				case "number":
					setNestedProperty(constants, keys, Number(input.value));
					break;
				case "boolean":
					setNestedProperty(constants, keys, input.value.toLowerCase() === "true");
					break;
				case "string":
					setNestedProperty(constants, keys, String(input.value));
					break;
				default:
					console.log("We haven't considered that type yet.");
					break;
			}
		}

		// Initialize the pattern array with newly randomised patterns
		objects.patternArray = Array.from({ length: constants.PATTERN_COUNT }, () => {
			return createPattern();
		});

		// Request the next frame if we have a valid ID
		if (wasPaused !== null) state.animationFrameId = requestAnimationFrame(animate);
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
		update: updateConstants,
	};
})();
