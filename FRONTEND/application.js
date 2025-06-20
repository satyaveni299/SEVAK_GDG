document.addEventListener('DOMContentLoaded', function () {
  // Form submission for application details
  document.querySelector('#application-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = {
      email: document.getElementById('email').value,
      full_name: document.getElementById('full-name').value,
      phone_number: document.getElementById('contact-number').value,
      bio: document.getElementById('bio').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      country: document.getElementById('country').value,
      profile_picture: document.getElementById('profile-upload').value,
      professional_role: document.getElementById('professional-role').value,
      skills: document.getElementById('skills').value
        ? document.getElementById('skills').value.split(',').map(skill => skill.trim())
        : [], // Handle empty skills field
      institution_name: document.getElementById('institution-name').value,
      highest_education_level: document.getElementById('highest-education').value,
      year_of_completion: document.getElementById('year-of-completion').value,
      experience: document.getElementById('experience').value,
    };

    // Store the data in localStorage
    

    // Submit application details to the server
    fetch('http://localhost:3000/submitForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          console.error(result.error);
          alert(`Error: ${result.error}`);
        } else {
         
          console.log(result.message);
          alert('Submission successful!');
          window.location.href = '/FRONTEND/profile.html'; // Redirect to the profile page
          localStorage.setItem('profileData', JSON.stringify(data));
        }
      })
      .catch(error => {
        console.error('Error during form submission:', error);
        alert('Error during form submission. Please try again later.');
      });
  });
});
