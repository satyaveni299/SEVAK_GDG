document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    localStorage.clear();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Data to send to the backend
    const payload = {
        email: email,
        password: password,
        role: "Volunteer", // Default role or you can make it dynamic
        profile_picture: "/FRONTEND/images/default_profile_pic.jpeg"
    };

    try {
        // Send the POST request to the API
        const response = await fetch('http://localhost:3000/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            alert('User created successfully!');
            console.log('Success:', result);
            // Redirect or clear the form
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert(result.error || 'Failed to sign up');
            console.error('Error:', result);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred while signing up. Please try again later.');
    }
});
