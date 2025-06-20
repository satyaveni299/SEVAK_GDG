const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form submission and page reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");
            
            window.location.href = "/FRONTEND/profile.html";
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userProfilePicture", data.profile_picture);
            localStorage.setItem("userId",data.user_id);
            

        } else {
            alert(data.error || "Login failed!");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again later.");
    }
});

// const loginForm = document.getElementById("loginForm");
// const loginButton = document.getElementById("loginButton");
// const profileContainer = document.getElementById("profileContainer");
// const profileImage = document.getElementById("profileImage");
// const userName = document.getElementById("userName");

// loginForm.addEventListener("submit", async (event) => {
//     event.preventDefault(); // Prevent form submission and page reload

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     // Disable the login button while waiting for the response
//     loginButton.disabled = true;
//     loginButton.textContent = "Logging in...";

//     try {
//         const response = await fetch("http://localhost:3000/login", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 email,
//                 password,
//             }),
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // Successfully logged in, display profile info
//             alert("Login successful!");
//             profileContainer.style.display = "block"; // Show the profile section
//             userName.textContent = email; // Display the username
//             profileImage.src = data.profile_picture; // Set profile picture source

//             // Optionally, store the user data in localStorage/sessionStorage if needed
//             localStorage.setItem("isLoggedIn", true);
//             localStorage.setItem("userEmail", email);
//             localStorage.setItem("userRole", data.role);
//             localStorage.setItem("userProfilePicture", data.profile_picture);

//             // Optionally, redirect to another page (e.g., user dashboard)
//             // window.location.href = "/profile.html";
//         } else {
//             alert(data.error || "Login failed!");
//         }
//     } catch (error) {
//         console.error("Error logging in:", error);
//         alert("An error occurred. Please try again later.");
//     } finally {
//         // Re-enable the login button after the request
//         loginButton.disabled = false;
//         loginButton.textContent = "Login";
//     }
// });
