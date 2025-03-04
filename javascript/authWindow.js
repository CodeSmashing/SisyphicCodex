const authWindow = (function () {
	const mainElement = document.querySelector("body main");
	const authWindowButton = document.querySelector("nav button#auth-button");
	const authForm = createNewElement("form", { method: "post", id: "auth-menu", onsubmit: "formInteraction(event);" });
	const authWindow = createNewElement("article", { name: "auth-window", children: [authForm] });
	let htmlStorage;

	async function main() {
		// Transfer PHP session state to JavaScript through an initial request
		const sessionResponse = await sendRequest("Requesting session data...", "check_session");
		updateAuthWindowToggle();

		htmlStorage = await fetch("../htmlStorage.json")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.catch((error) => {
				console.error("Unable to fetch data:", error);
			});

		authWindowButton.addEventListener("click", async () => {
			const action = authWindowButton.dataset.action;
			if (action === "sign-in") return toggleAuthWindow();
			await sendRequest("Requesting sign out...", "sign-out");
			updateAuthWindowToggle();
		});

		// Set the initial form content
		authForm.innerHTML = htmlStorage["auth-form"][sessionStorage.getItem("signedIn") ? "sign-in" : "sign-up"].join("");
		setAuthContent();

		// Authwindow closing when pressing escape
		document.addEventListener("keydown", (event) => {
			switch (event.key) {
				case "Escape":
					if (document.querySelector("[name='auth-window']")) mainElement.removeChild(authWindow);
					break;
				default:
					break;
			}
		});
	}

	// Update button text and action
	function updateAuthWindowToggle() {
		if (sessionStorage.getItem("signedIn")) {
			authWindowButton.setAttribute("data-action", "sign-out");
			authWindowButton.textContent = "Sign out";
		} else {
			authWindowButton.setAttribute("data-action", "sign-in");
			authWindowButton.textContent = "Sign up/ in";
		}
	}

	// Removes or inserts the window
	function toggleAuthWindow() {
		if (Array.from(mainElement.children).includes(authWindow)) {
			mainElement.removeChild(authWindow);
		} else {
			mainElement.insertAdjacentElement("beforeend", authWindow);
		}
	}

	// Dynamically change the form depending on which label the user clicks
	function setAuthContent() {
		const authSwitchLabels = authForm.querySelectorAll("label[data-switch]");
		for (const label of authSwitchLabels) {
			label.addEventListener("click", () => {
				authForm.innerHTML = htmlStorage["auth-form"][label.dataset.switch].join("");
				setAuthContent();
			});
		}

		// Set the retun button
		const authWindowMenuReturn = authForm.querySelector("#auth-menu-return");
		authWindowMenuReturn.addEventListener("click", () => {
			toggleAuthWindow();
		});
	}

	return {
		run: main,
		updateAuthWindowToggle,
		toggleAuthWindow,
	};
})();

document.addEventListener("DOMContentLoaded", authWindow.run());
