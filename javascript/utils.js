/**
 * Picks a pseudo-random value within a specified range.
 * @param {number} min Minimum of the range, defaults to 0.
 * @param {number} max Maximum of the range, defaults to 20.
 * @returns {number} Returns the rounded picked value.
 */
function getRandomInt(min = 0, max = 20) {
	return Math.round(Math.random() * (max - min)) + min;
}

/**
 * Picks a pseudo-random value within a specified range that is a multiple of a different given number.
 * @param {number} min
 * @param {number} max
 * @param {number} multipleOf
 * @returns {number} Returns the rounded picked value
 */
function getRandomIntMultiple(min, max, multipleOf) {
	return Math.round(getRandomInt(min, max) / multipleOf) * multipleOf;
}

/**
 * Picks a pseudo-random boolean value with an optional likelyhood input.
 * @param {number} chance A value to check against, defaults to 0.5.
 * @returns {boolean} Returns a boolean, true if a pseudo-random number between 0 and 1 is less then chance, otherwise false.
 */
function getRandomBool(chance = 0.5) {
	return Math.random() < chance;
}

/**
 * Creates an array of objects that represent RGB color values along with a state property to indicate if a value is increasing or decreasing.
 * @param {number} min Minimum of the color range, defaults to 0.
 * @param {number} max Maximum of the color range, default to 255.
 * @returns {Array<{}>} Returns an array of 3 objects, one for each of the RGB values. Objects contain a random value within given range, and a state indicating if it's increasing or decreasing.
 */
function getRandomColor(min = 0, max = 255) {
	return Array.from({ length: 3 }, () => ({
		value: getRandomInt(min, max),
		state: getRandomBool(),
	}));
}

/**
 * Debounce solution from Mr. Polywhirl: https://stackoverflow.com/questions/75988682/debounce-in-javascript
 *
 * Original source Josh W. Comeau: https://www.joshwcomeau.com/snippets/javascript/debounce/
 *
 * Creates a debounced function that delays invoking the callback until after wait milliseconds have elapsed since the last time the debounced function was invoked.
 * @param {Function} callback The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} Returns the new debounced function.
 */
function debounce(callback, wait) {
	let timeoutId = null;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			callback(...args);
		}, wait);
	};
}

/**
 * Sets a single nested property inside a given object.
 *
 * Solution provided completely by AI, got no source.
 * @param {object} obj Original object to search through.
 * @param {Array<string>} path Array containing the full list of property keys leading to, and including, the property to change.
 * @param {*} value New value to set the searched for property to.
 * @returns {*} Returns the adjusted value.
 */
function setNestedProperty(obj, path, value) {
	if (typeof path === "string") {
		path = path.split(".");
	}

	return path.reduce((current, key, index) => {
		if (index === path.length - 1) {
			current[key] = value;
		} else {
			current[key] = current[key] || {};
		}

		return current[key];
	}, obj);
}

/**
 * Creates a new html element and sets it's respective properties if given.
 * @param {string} element String name of the element.
 * @param {Object} properties Properties to set for the element.
 * @returns {node} Returns the node of the newly created element.
 */
function createNewElement(element, properties) {
	element = document.createElement(element);
	for (const [key, value] of Object.entries(properties)) {
		switch (key) {
			case "width":
			case "height":
			case "id":
			case "type":
			case "name":
			case "value":
			case "method":
			case "step":
			case "onsubmit":
			case "href":
			case "src":
				element.setAttribute(key, value);
				break;
			case "innerHTML":
				element.innerHTML = value;
				break;
			case "classList":
				if (Array.isArray(value)) element.classList.add(...value);
				break;
			case "textContent":
				element.textContent = value;
				break;
			case "listeners":
				if (Array.isArray(value)) {
					value.forEach((listener) => {
						element.addEventListener(listener.type, () => {
							listener.action;
						});
					});
				}
				break;
			case "style":
				if (typeof value === "object") {
					for (const [styleKey, styleValue] of Object.entries(value)) {
						element.style[styleKey] = styleValue;
					}
				}
				break;
			case "children":
				for (const child of value) {
					element.appendChild(child);
				}
				break;
			default:
				console.log(`Unhandled property: ${key}`); // console.warn();
				break;
		}
	}
	return element;
}

/**
 * Adjusts the color values of a given RGB array.
 * @param {Array<{}>} fillColor Array to manipulate.
 * @param {number} min Minimum of the color range.
 * @param {number} max Maximum of the color range.
 * @returns {string} Returns a string in the format of rgb(r, g, b) with the updated color values.
 */
function adjustColor(fillColor, min = 0, max = 255) {
	// Loop through each color component defined in the cube.color array
	for (const color of fillColor) {
		// Adjust value based on state
		color.value += color.state ? -1 : 1;

		// Clamp values and update state accordingly
		if (color.value <= min) {
			color.value = min;
			color.state = !color.state; // Start increasing when reaching 0
		} else if (color.value >= max) {
			color.value = max;
			color.state = !color.state; // Start decreasing when reaching max
		}
	}

	return `rgb(${fillColor[0].value}, ${fillColor[1].value}, ${fillColor[2].value})`;
}

/**
 * Check to see if a given number lies in a specified range.
 * @param {number} number Number to search for.
 * @param {number} min Minimum of the range.
 * @param {number} max Maximum of the range.
 * @returns {boolean} Returns a boolean, true if the given number is included in the range, false otherwise.
 */
function isInRange(number, min, max) {
	return number >= min && number <= max;
}

/**
 * Picks a pseudo-random element from a given array.
 * @param {Array<*>} list Array to search through.
 * @returns {*} Returns a pseudo-randomly picked element.
 */
function getRandomArrayElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

// // To get already existing session data
// function getSessionData() {
// 	const signedInData = JSON.parse(sessionStorage.getItem("signedIn"));
// }

// function setSessionStorageItem(key, action, value) {
// 	if (action === "add") {
// 		sessionStorage.setItem(key, value);
// 	} else {
// 		sessionStorage.removeItem(key);
// 	}

// 	window.dispatchEvent(
// 		new CustomEvent("sessionStorageUpdate", {
// 			detail: { item: key, action },
// 		})
// 	);
// }

/**
 * To send asynchronous requests to process.php
 * @param {String} message
 * @param {String} action
 * @param {Object} info
 * @returns {json} Returns a JSON response
 */
async function sendRequest(message, action, info = {}) {
	console.log(message);

	try {
		const response = await fetch("../php/process.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				info: JSON.stringify(info),
				action,
			}),
		}).then((response) => {
			return response.json();
		});

		console.log("The request response: ", response);
		if (response.signed_in) {
			sessionStorage.setItem("signedIn", "add", JSON.stringify(response.session));
		} else if (action === "sign-out") {
			sessionStorage.removeItem("signedIn");
		}
		return response;
	} catch (error) {
		console.error("Error: ", error);
	}
}
