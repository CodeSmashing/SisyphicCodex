const loop = (function () {
	// Properties that hardly change
	const constants = {
		// Related to movement
		MARGIN: 5,

		// Related to audio
		AUDIO_DOM: new Audio("../audio/bricklover__walking-snow.mp3"),
		VALID_RANGES: [
			{
				startTime: 0,
				endTime: 0.9,
			},
			{
				startTime: 0.975,
				endTime: 1.8,
			},
			{
				startTime: 1.832,
				endTime: 2.651,
			},
			{
				startTime: 2.671,
				endTime: 3.291,
			},
			{
				startTime: 3.39,
				endTime: 4.202,
			},
			{
				startTime: 4.28,
				endTime: 5.099,
			},
			{
				startTime: 5.033,
				endTime: 5.924,
			},
			{
				startTime: 5.94,
				endTime: 6.824,
			},
			{
				startTime: 6.854,
				endTime: 7.619,
			},
			{
				startTime: 7.341,
				endTime: 8.201,
			},
			{
				startTime: 9.691,
				endTime: 10.496,
			},
			{
				startTime: 11.095,
				endTime: 11.934,
			},
		],

		// Misc. properties
		FRAME_DELAY: 200,
		MAX_WIDTH: 255,
		MAX_HEIGHT: 255,
	};

	// Properties that keep track of the game's current state
	const state = {
		keysPressed: {},
		animationFrameId: null,
		movementCooldown: false,
		chosenRange: constants.VALID_RANGES[Math.floor(Math.random() * constants.VALID_RANGES.length)],
		lastTime: 0,
	};

	// "Game-world" objects
	const objects = {
		tracker: {
			position: {
				x: {
					value: 0,
					domElement: createNewElement("span", { textContent: 0 }),
					gradient: {
						direction: "left",
						domElement: createNewElement("div", { classList: ["overlay"] }),
					},
				},
				y: {
					value: 0,
					domElement: createNewElement("span", { textContent: 0 }),
					gradient: {
						direction: "top",
						domElement: createNewElement("div", { classList: ["overlay"] }),
					},
				},
			},
			get domElement() {
				let x = this.position.x.domElement;
				let y = this.position.y.domElement;

				return createNewElement("label", { classList: ["positionTracker"], children: [
					createNewElement("span", { textContent: "(" }),
					x,
					createNewElement("span", { textContent: "," }),
					y,
					createNewElement("span", { textContent: ")" })
				]});
			},
		},
		flashlight: { domElement: createNewElement("div", { classList: ["overlay", "hide"] }) },
	};

	function main() {
		const bodyElement = document.querySelector("body");
		const articleElement = bodyElement.querySelector("article");
		const formElement = articleElement.querySelector("form");
		const footerElement = createNewElement("footer", {});
		const htmlAttributionString = `<a href="https://freesound.org/people/Bricklover/sounds/560956/">Walking - Snow</a> by <a href="https://freesound.org/people/Bricklover/">Bricklover</a> | License: <a href="http://creativecommons.org/publicdomain/zero/1.0/">Creative Commons 0</a>`;

		// Initial page / element styling
		document.title = "The loop";
		bodyElement.style.backgroundColor = "white";
		articleElement.style.backgroundColor = "transparent";
		articleElement.removeChild(formElement);
		footerElement.innerHTML = htmlAttributionString;
		bodyElement.appendChild(footerElement);

		// Add objects like the "darkness" and "flashlight" gradients etc.
		articleElement.appendChild(objects.tracker.position.y.gradient.domElement);
		articleElement.appendChild(objects.tracker.position.x.gradient.domElement);
		articleElement.appendChild(objects.flashlight.domElement);
		objects.flashlight.domElement.style.background = `radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 12%)`;
		articleElement.appendChild(objects.tracker.domElement);

		// User input listeners
		document.addEventListener("keydown", handleInput);
		document.addEventListener("keyup", handleInput);

		// Initial animation start
		state.animationFrameId = requestAnimationFrame(animate);
	}

	function animate(currentTime) {
		// Check the elapsed time since the last frame
		const timeElapsed = currentTime - state.lastTime;

		if (timeElapsed > constants.FRAME_DELAY) {
			// We allow new movement if there isn't any movement audio playing and if correct keys are being pressed
			if (constants.AUDIO_DOM.paused) {
				const { movementCooldown, keysPressed } = state;
				if (!movementCooldown && Object.keys(keysPressed).length > 0) {
					state.movementCooldown = true;
					updateMovement();
					playAudio();
				}
			}

			// Update the last time to the current time
			state.lastTime = currentTime;
		}

		// Request the next frame if we have a valid ID
		if (state.animationFrameId !== null) state.animationFrameId = requestAnimationFrame(animate);
	}

	function handleInput(event = null) {
		const directions = ["z", "s", "q", "d", " "];

		if (event !== null) {
			// If the input isn't what we want, we exit early
			if (!directions.includes(event.key)) return;
			if (event.type === "keydown") {
				if (event.key === " ") {
					objects.flashlight.domElement.classList.toggle("hide");
				} else {
					state.keysPressed[event.key] = true;
				}
			} else if (event.type === "keyup") {
				delete state.keysPressed[event.key];
			}
		}
	}

	function playAudio() {
		const { startTime, endTime } = state.chosenRange;
		const { AUDIO_DOM, VALID_RANGES } = constants;

		AUDIO_DOM.currentTime = startTime;
		AUDIO_DOM.play();
		setTimeout(() => {
			AUDIO_DOM.pause();
			AUDIO_DOM.currentTime = 0;
			state.movementCooldown = false;
			state.chosenRange = VALID_RANGES[Math.floor(Math.random() * VALID_RANGES.length)];
		}, (endTime - startTime) * 1000);
	}

	function updateMovement() {
		const { position } = objects.tracker;
		const { keysPressed } = state;

		// Update the position values based on the last direction
		for (const key of Object.keys(keysPressed)) {
			switch (key) {
				case "z":
					position.y.value += constants.MARGIN;
					break;
				case "s":
					position.y.value -= constants.MARGIN;
					break;
				case "q":
					position.x.value -= constants.MARGIN;
					break;
				case "d":
					position.x.value += constants.MARGIN;
					break;
				default:
					break;
			}
		}

		for (let [axis, { value, gradient, domElement }] of Object.entries(position)) {
			const comparison = axis === "x" ? constants.MAX_WIDTH : constants.MAX_HEIGHT;

			// Check for bounds (loop around)
			if (value > comparison) {
				position[axis].value = value = -comparison;
			} else if (value < -comparison) {
				position[axis].value = value = comparison;
			}

			// Update gradients relative to (0,0)
			let stop1 = -Math.abs(value) - (value / 5);
			let stop2 = comparison - Math.abs(value);
			let alpha = Math.abs(value) / (comparison / 2);
			if (value < 0) {
				gradient.direction = (axis === "x") ? "left" : "bottom";
			} else if (value > 0) {
				gradient.direction = (axis === "x") ? "right" : "top";
			}

			// Set dom element styling and text content
			domElement.textContent = value;
			gradient.domElement.style.background = `linear-gradient(to ${gradient.direction}, transparent ${stop1}%, rgba(0, 0, 0, ${alpha}) ${stop2}%)`;
		}
	}

	return {
		run: main,
	};
})();
