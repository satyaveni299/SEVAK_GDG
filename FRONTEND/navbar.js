// Fetch navbar content dynamically
fetch('navbar.html')
.then(response => response.text())
.then(data => {
  document.getElementById('navbar-container').innerHTML = data;
});

// Count-up animation for menu
function toggleMenu() {
    var menu = document.getElementById('mobile-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Handle login state dynamically from localStorage
function handleLoginState() {
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const profileContainer = document.getElementById("profile-container");
    const mobileLoginBtn = document.getElementById("mobile-login-btn");
    const mobileSignupBtn = document.getElementById("mobile-signup-btn");
    const mobileProfileContainer = document.getElementById("mobile-profile-container");
    const profileImage = document.getElementById("profile-image"); // Profile image element

    // Retrieve the login status from localStorage
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Convert to boolean

    // Check if logged in
    if (isLoggedIn) {
        // Hide login and signup buttons (desktop)
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";

        // Show profile container (desktop)
        if (profileContainer) {
            profileContainer.style.display = "flex";

            // Add logout button if it doesn't exist
            if (!document.getElementById("logout-btn")) {
                const logoutBtn = document.createElement("button");
                logoutBtn.id = "logout-btn";
                logoutBtn.className = "logout-button";
                logoutBtn.textContent = "Log out";
                logoutBtn.addEventListener("click", handleLogout);
                profileContainer.appendChild(logoutBtn);
            }
        }

        // Hide login and signup buttons (mobile)
        if (mobileLoginBtn) mobileLoginBtn.style.display = "none";
        if (mobileSignupBtn) mobileSignupBtn.style.display = "none";

        // Show profile container (mobile)
        if (mobileProfileContainer) mobileProfileContainer.style.display = "flex";

        // Add logout option in mobile menu
        if (!document.getElementById("mobile-logout-btn")) {
            const mobileLogout = document.createElement("button");
            mobileLogout.id = "mobile-logout-btn";
            mobileLogout.className = "logout-button mobile";
            mobileLogout.textContent = "Log out";
            mobileLogout.addEventListener("click", handleLogout);
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu) mobileMenu.appendChild(mobileLogout);
        }

        // Dynamically update the profile image from localStorage
        const profilePicture = localStorage.getItem("userProfilePicture"); // Get the image URL from localStorage
        if (profileImage && profilePicture) {
            profileImage.src =  "/FRONTEND/images/default_profile_pic.jpeg"; // Set the image source from the stored URL
        }
    } else {
        // Revert to logged-out state
        if (loginBtn) loginBtn.style.display = "block";
        if (signupBtn) signupBtn.style.display = "block";
        if (profileContainer) {
            profileContainer.style.display = "none";
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) logoutBtn.remove();
        }
        if (mobileLoginBtn) mobileLoginBtn.style.display = "block";
        if (mobileSignupBtn) mobileSignupBtn.style.display = "block";
        if (mobileProfileContainer) mobileProfileContainer.style.display = "none";

        const mobileLogout = document.getElementById("mobile-logout-btn");
        if (mobileLogout) mobileLogout.remove();

        // Reset the profile image to a default if no image is found in localStorage
        if (profileImage) {
            profileImage.src = "/FRONTEND/images/default_profile_pic.jpeg"; // Replace with the logged-out/default image path
        }
    }
}


function handleLogout() {
    
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userProfilePicture"); 
    
    // Update the UI
    handleLoginState();

    // Redirect to the homepage or login page
    window.location.href = "/FRONTEND/home.html"; // Adjust to your actual redirect URL
    alert("You have logged out.");
}

// Example: Simulating login after a successful login action
// This part is for testing purposes only
function simulateLogin() {
    // Set login state in localStorage
    // localStorage.setItem("isLoggedIn", "true");

    // Update the UI
    handleLoginState();
}

// Call the login state handler on page load
document.addEventListener("DOMContentLoaded", () => {
    handleLoginState();

    // Simulate login for testing purposes
    setTimeout(simulateLogin, 1000); // Remove this for production
});


