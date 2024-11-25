const snake = (function () {
	let { clientWidth: maxWidth, clientHeight: maxHeight } = document.documentElement;
	let context;
	let animationFrameId = null;
	let snakeBody = [ 0 ];

	const snakeConstants = {
		// Constants for movement
		MARGIN: 5,

		// Misc.
		WIDTH: 3,
		IS_PAUSED: false,

		// Constants for color
		COLOR_RANGE: { MIN: 0, MAX: 255 },
		FILL_COLOR: "green",
	};

	function main() {
		const bodyElement = document.querySelector("body");
		bodyElement.innerHTML = "";
		bodyElement.style.backgroundColor = "black";
	}

	function snakeDraw() {

	}

	function snakeMovement() {

	}

	function createBodyPart() {
		snakeBody.push({
			fillColor: snakeConstants.FILL_COLOR,
			position: {
				x: 0,
				y: 0,
			},
		});
	}

	return {
		run: main,
	}
})();
