// Global variable to store job details
let jobDetails = null;

// Function to fetch job listings from the backend and apply filters
async function fetchJobListings() {
  try {
    // Fetch jobs from the server
    const response = await fetch('http://localhost:3000/allJobs');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const jobs = await response.json();
    
    // Hide the fallback container on a successful response
    document.getElementById('fallback-container').style.display = 'none';

    const jobListingsContainer = document.getElementById('job-listings');
    jobListingsContainer.innerHTML = '';

    const imageLinks = [
      "https://img.lovepik.com/free-png/20220125/lovepik-labour-day-png-image_401727417_wh860.png",
      "https://static.vecteezy.com/system/resources/previews/005/084/935/non_2x/team-of-builders-and-contractor-industrial-workers-standing-together-in-job-site-free-vector.jpg",
      "https://th.bing.com/th/id/OIP.SByCAsp5x2xX6kUOYhxxIwHaHa?pid=ImgDet&w=195&h=195&c=7&dpr=1.4"
    ];

    // Function to choose a random image from the list
    function getRandomImage() {
      const randomIndex = Math.floor(Math.random() * imageLinks.length); // Generate a random index
      return imageLinks[randomIndex]; // Return the image at that index
    }

    // Get selected filters (categories and status)
    const selectedFilters = await getSelectedFilters();
    
    // Filter jobs based on selected filters (categories and status)
    const filteredJobs = filterJobs(jobs, selectedFilters);

    // Display filtered jobs
    filteredJobs.forEach(job => {
      const jobCard = document.createElement('div');
      jobCard.className = 'forworkers-job-card';

      // Determine status class based on job status
      let statusClass = '';
      if (job.status.toLowerCase() === 'open') statusClass = 'open';
      else if (job.status.toLowerCase() === 'pending') statusClass = 'pending';
      else if (job.status.toLowerCase() === 'closed') statusClass = 'closed';

      jobCard.innerHTML = `
        <a href="apply_page.html" class="job-card-link">
          <img alt="${job.title}" src="${getRandomImage()}" width="200" height="150"/>
          <h3>${job.title}</h3>
          <p>${job.location}</p>
          <p class="status ${statusClass}">${job.status}</p>
          <button onclick="applyForJob(${job.job_id})" class="job-apply-btn">Apply</button>
        </a>
      `;

      jobListingsContainer.appendChild(jobCard);
    });
    console.log("console working");

  } catch (error) {
    console.error('Error fetching job listings:', error);
    document.getElementById('fallback-container').style.display = 'block';
  }
}

// Function to get selected filters (categories and status) for filtering
function getSelectedFilters() {
  return new Promise((resolve) => {
    const categories = Array.from(document.querySelectorAll('#categories-filter input[type="checkbox"]:checked'))
      .map((checkbox) => checkbox.value);

    const status = Array.from(document.querySelectorAll('#status-filter input[type="radio"]:checked'))
      .map((radio) => radio.value);

    // If no categories are selected, consider "All" categories selected
    if (categories.length === 0) {
      categories.push("All");
    }

    // If no status is selected, consider "All" status selected
    if (status.length === 0) {
      status.push("All");
    }

    console.log('Selected Categories:', categories);
    console.log('Selected Status:', status);

    resolve({ categories, status });
  });
}

// Function to filter jobs based on selected categories and status
function filterJobs(jobs, selectedFilters) {
  return jobs.filter(job => {
    const { categories, status } = selectedFilters;

    // Filter by categories
    const categoryMatch = categories.includes('All') || categories.some(category => job.category.toLowerCase().includes(category.toLowerCase()));

    // Filter by status
    const statusMatch = status.includes('All') || status.some(st => job.status.toLowerCase() === st.toLowerCase());

    // Job must match both category and status filters
    return categoryMatch && statusMatch;
  });
}

// Event listener for Apply Filter button
document.getElementById('apply-filter-btn').addEventListener('click', function() {
  fetchJobListings(); // Call the fetchJobListings function when the button is clicked
});



async function applyForJob(jobId) {
    console.log(`Applying for job with ID: ${jobId}`);
 

    try {
        const response = await fetch(`http://localhost:3000/allJobs/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Job not found or other error');
        }

        const data = await response.json();
        alert(`You are applying for the job: ${data.title}`);
        console.log('Job Details:', data);
         localStorage.setItem('jobDetails', JSON.stringify(data));
        
    } catch (error) {
        console.error('Error applying for job:', error);
        alert('Failed to fetch job details');
    }

    // Delay to ensure console log shows up
    setTimeout(() => {
        console.log("console working");
    }, 500);
}


// function applyToJob(jobId) {
//     // Logic for applying to the job (could be another API call or UI change)
//     console.log(`Successfully applied for job ID: ${jobId}`);
//     // You can now trigger backend logic to mark the job as applied
// }


fetchJobListings();
console.log(jobDetails);

