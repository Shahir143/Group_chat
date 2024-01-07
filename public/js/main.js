const username = document.getElementById("username-signup");
const email = document.getElementById("email-signup");
const phoneNumber = document.getElementById("contact-number");
const password = document.getElementById("password");
const imgUrl=document.getElementById('imgUrl');
const bioText=document.getElementById('bio')
const sign_up_btn = document.querySelector("#sign-up-btn");
const signupButton = document.getElementById("signup-button");

// DOM Elements for Sign In
const signinName = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const sign_in_btn = document.querySelector("#sign-in-btn");
const signinButton = document.getElementById("signin-button");
const container = document.querySelector(".container");
const BASE_URL='http://13.233.123.136:4000';
// Event Listeners
sign_up_btn.addEventListener("click", () => {
	container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
	container.classList.remove("sign-up-mode");
});

signupButton.addEventListener("click", signup);
signinButton.addEventListener("click", signin);

/**
 * Function for handling user sign-up.
 */
async function signup() {
	try {
		// Form validation
		if (isInputEmpty(username) || isInputEmpty(email) || isInputEmpty(phoneNumber) || isInputEmpty(password)) {
			throw new Error("Please enter all details");
		}
		if(isInputEmpty(imgUrl)){
			imgUrl.value="https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg"
		}
		if(isInputEmpty(bio)){
			bio.value="No Calls Direct Whatspp Msgs"
		}
		// User details
		const signupDetails = {
			username: username.value,
			email: email.value,
			phoneNumber: phoneNumber.value,
			password: password.value,
			profile_picture:imgUrl.value,
			bio:bio.value
		};

		// Make a POST call to the backend to save user information
		const response = await axios.post(`${BASE_URL}/user/signup`, signupDetails);

		if (response.status === 200) {
			alert("Account created successfully. Log in to continue.");
			clearInputs(username, email, phoneNumber, password);
			container.classList.remove("sign-up-mode");
		} else if (response.status === 201) {
			alert("User already exists. Log in to continue.");
		}
	} catch (error) {
		handleError(error, "Error signing up");
	}
}


async function signin(e) {
	e.preventDefault();
	try {
		// Form validation
		if (isInputEmpty(signinName) || isInputEmpty(signinPassword)) {
			throw new Error("Please fill in all details");
		}

		// User details
		const signinDetails = {
			username: signinName.value,
			password: signinPassword.value,
		};

		// Make a POST call to the backend to verify user credentials
		const response = await axios.post(`${BASE_URL}/user/login`, signinDetails);

		if (response.status === 200) {
			// Store the user information (encrypted ID) in local storage for authentication
			localStorage.setItem("token", response.data.encryptedId);
			clearInputs(signinName, signinPassword);
			alert("Logged in successfully.");
			console.log("logged")
			window.location.href = "./chat.html"; // Redirect to chat page

		} else if (response.status === 401) {
			alert("Invalid password. Please enter the correct password.");
			clearInputs(signinPassword);
            
		} else if (response.status === 404) {
			alert("User not found. Please sign up.");
			clearInputs(signinName, signinPassword);
			container.classList.add("sign-up-mode");
		}
	} catch (error) {
		handleError(error, "Login failed. Please refresh and try again.");
	}
}


function isInputEmpty(input) {
	return input.value.trim() === "";
}


function clearInputs(...inputs) {
	inputs.forEach((input) => (input.value = ""));
}

function handleError(error, message) {
	console.error(message);
	console.error(error.message);
	alert(message);
}