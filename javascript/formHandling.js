function formInteraction(event) {
	event.preventDefault();
	event.submitter.blur();
	const formId = event.target.id;

	switch (formId) {
		case "auth-menu":
			formValidation(event);
			break;
		case "start-menu":
			switch (event.submitter.name) {
				case "cubes":
					cube.run();
					break;
				case "pattern":
					pattern.run();
					break;
				case "snake":
					snake.run();
					break;
				case "loop":
					loop.run();
					break;
				default:
					console.log("We haven't considerd that option yet.");
					break;
			}
			break;
		case "pattern-menu":
			pattern.update(event.target);
			break;
		default:
			console.log("We haven't considerd that form yet.");
			break;
	}
}

async function formValidation(event) {
	// Check if form input meets required conditions before sending it to process.php
	const inputs = Array.from(event.target.querySelectorAll("input"));
	const action = event.submitter.dataset.action;
	const actionMessages = {
		"sign-in": "Requesting sign in...",
		"sign-up": "Requesting sign up...",
		"password-reset": "Requesting password reset...",
	};

	const selectorUsername = inputs.find((input) => input.id.includes("-username"));
	const selectorPassword = inputs.find((input) => input.id.includes("-password") && input.id.slice(-1) !== "-");
	const selectorPasswordConfirm = inputs.find((input) => input.id.includes("-confirm"));

	const inputUsername = selectorUsername.value.trim();
	const inputPassword = selectorPassword.value.trim();
	const inputPasswordConfirm = selectorPasswordConfirm ? selectorPasswordConfirm.value.trim() : undefined;

	const regExpUsername = /^(?=.*[\w.])[\w.]{4,25}$/;
	const regExpPassword = /^(?=.*[\w])[\w!@#$%^&*]{8,64}$/;

	if (inputUsername == undefined || regExpUsername.test(inputUsername) === false) {
		selectorUsername.classList.add("error");
		return;
	}

	if (inputPassword == undefined || regExpPassword.test(inputPassword) === false) {
		selectorPassword.classList.add("error");
		return;
	}

	if (selectorPasswordConfirm) {
		if (inputPasswordConfirm == undefined || regExpPassword.test(inputPasswordConfirm) === false) {
			selectorPassword.classList.add("error");
			selectorPasswordConfirm.classList.add("error");
			return;
		}

		if (inputPassword !== inputPasswordConfirm) {
			selectorPassword.classList.add("error");
			selectorPasswordConfirm.classList.add("error");
			return;
		}
	}

	await sendRequest(actionMessages[action] || "Sending request...", action, { username: inputUsername, password: inputPassword });
	authWindow.updateAuthWindowToggle();
	if (sessionStorage.getItem("signedIn")) authWindow.toggleAuthWindow();
}
