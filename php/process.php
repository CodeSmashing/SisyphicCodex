<?php
ini_set("session.cookie_samesite", "Lax");
ini_set("display_errors", 0);
ini_set("log_errors", 1);
ini_set("error_log", "../logs/error.log");
error_reporting(E_ALL);

session_start();
header("Content-Type: application/json");

set_exception_handler(function (Throwable $e) {
	error_log("Uncaught exception: " . $e->getMessage(), 0);
	http_response_code(500);
	echo json_encode(["error" => "An unexpected error occurred. Please try again later."]);
});

include_once $_SERVER["DOCUMENT_ROOT"] . "/php/sqlquerys.php";
$exit_reason = "";
$server_message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$request_info = json_decode($_POST['info'], true) ?? json_decode($_POST['info'], true);
	$request_action = $_POST["action"];
	unset($_POST["info"]);
	unset($_POST["action"]);

	switch ($request_action) {
		case "sign-in":
		case "sign-up":
		case "password-reset":
			// Exit early if no info is given and we try to sign up/in
			if (empty($request_info)) {
				$exit_reason = "Either no username or password were given";
				$server_message = "According to us, we were't given a username or password to check against.";
				break;
			};

			$users_database = sqlSelectUserList($pdo); // Array of users as objects

			// Create an associative array with usernames as keys for faster lookups
			$usernames = array_flip(array_map("strtolower", array_column($users_database, "name")));

			// Filter options
			$options = [
				"options" => [
					"regexp" => "/^[a-zA-Z0-9_]+$/"
				]
			];

			// Prepare for comparisons
			$input_username = trim(filter_var($request_info["username"], FILTER_VALIDATE_REGEXP, $options));
			$input_password = trim(filter_var($request_info["password"]));
			$hash = password_hash($input_password, PASSWORD_DEFAULT);

			switch ($request_action) {
				case "sign-in":
					foreach ($users_database as $user_object) {
						if ($user_object["name"] === $input_username) {
							if (password_verify($input_password, $user_object["password"])) {
								// If a user is found with the same name and password
								$_SESSION["signed_in"] = [
									"level" => $user_object["level"],
									"user" => $user_object["name"],
								];

								$exit_reason = "Credentials correct";
								$server_message = "According to us, the given username and password match that of someone in our database.";
								break;
							}
						}

						$exit_reason = "Credentials incorrect";
						$server_message = "According to us, the given username or password don't match that of anyone in our database.";
						break;
					}
					break;
				case "sign-up":
					// If username is already in use
					if (isset($usernames[strtolower($input_username)])) {
						$exit_reason = "Name unavailable";
						$server_message = "According to us, this username is already in use.";
						break;
					}

					// Create next user, welcome!
					$user_object = sqlInsertUser($pdo, $input_username, $hash);

					$_SESSION["signed_in"] = [
						"level" => $user_object["level"],
						"user" => $user_object["name"],
					];

					$exit_reason = "Succesfully created user";
					$server_message = "According to us, this username isn't in use.";
					break;
				case "password-reset":
					foreach ($users_database as $user_object) {
						if ($user_object["name"] === $input_username) {
							// If a user is found with the same name
							sqlUpdateUser($pdo, $input_username, $hash);

							$_SESSION["signed_in"] = [
								"level" => $user_object["level"],
								"user" => $user_object["name"],
							];

							$exit_reason = "Reset succesfull";
							$server_message = "According to us, the user password was succesfully reset.";
							break;
						}

						$exit_reason = "Credentials incorrect";
						$server_message = "According to us, the given username doesn't match that of anyone in our database.";
						break;
					}
					break;
				default:
					// code...
					break;
			}
			break;
		case "check_session":
			$exit_reason = "Session check complete";
			$server_message = "According to us, the session was checked succesfully.";
			break;
		case "sign-out":
			unset($_SESSION["signed_in"]);

			$exit_reason = "Signout succesfull";
			$server_message = "According to us, the signing out was a success.";
			break;
		default:
			break;
	}
} else {
	// handle non-POST requests
}

// If all goes well, exit and send a JSON response
exit(json_encode([
	"success" => true,
	"signed_in" => !empty($_SESSION["signed_in"]),
	"session" => !empty($_SESSION["signed_in"]) ? $_SESSION["signed_in"] : null,
	"exit-reason" => $exit_reason,
	"server-message" => $server_message
]));
