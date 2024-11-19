// Function to generate a random integer within a specified range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// Function to generate a random boolean value
function getRandomBool() {
    return Math.random() < 0.5; // Returns true or false with equal probability
}

// Function to generate a random color as an array of RGB values
function getRandomColor(min, max) {
    return Array.from({ length: 3 }, () => ({
        value: getRandomInt(min, max),
        state: getRandomBool(),
    }));
}

// Function to set a nested property, returns end value
// Solution provided by AI
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

// Function to see if a given number lies in a specific range
function isInRange(number, min, max) {
    return (number >= min) && (number <= max);
}

// Get a random element from any given array
function getRandomArrayElement(list) {
    return list[Math.floor(Math.random() * list.length)];
}
