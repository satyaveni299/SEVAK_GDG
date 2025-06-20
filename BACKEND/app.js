const express = require('express');
const app = express();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { promisify } = require('util');

const dbpath = path.join(__dirname, 'sevak.db');
let db = null;
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


const initializeDBAndServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000/');
  });
};

initializeDBAndServer();

// Sign Up Endpoint
app.post('/signUp', async (request, response) => {
  const { email, password, role, profile_picture } = request.body;

  const userRole = role || 'Volunteer';
  const userProfilePicture = profile_picture || '/FRONTEND/images/default_profile_pic.png';

  try {
    // Check if the user already exists
    const isAlreadyExistQuery = `SELECT * FROM User WHERE email = ?`;
    const dbUser = await db.get(isAlreadyExistQuery, [email]);

    if (dbUser) {
      return response.status(400).send({ error: 'User already exists' });
    }

    // Validate password length and complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return response.status(400).send({ error: 'Password must be stronger (min 8 chars, incl. uppercase, lowercase, number, special character)' });
    }

    // Hash the password
    const hashedPass = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertQuery = `INSERT INTO User (email, password, role, profile_picture) VALUES (?, ?, ?, ?)`;
    await db.run(insertQuery, [email, hashedPass, userRole, userProfilePicture]);

    return response.status(200).send({ message: 'User created successfully', email, role: userRole });
  } catch (error) {
    console.error('Error during user creation:', error.message);
    return response.status(500).send({ error: 'Server Error' });
  }
});

app.post('/login', async (request, response) => {
    const { email, password } = request.body;

    try {
        // Check if the user exists
        const getUserQuery = `SELECT * FROM User WHERE email = ?`;
        const dbUser = await db.get(getUserQuery, [email]);

        if (!dbUser) {
            return response.status(400).send({ error: 'Invalid email or password' });
        }

        // Compare the password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, dbUser.password);

        if (!isPasswordValid) {
            return response.status(400).send({ error: 'Invalid email or password' });
        }

        // Login successful
        return response.status(200).send({
            user_id: dbUser.user_id,
            message: 'Login successful',
            email: dbUser.email,
            role: dbUser.role,
            profile_picture: dbUser.profile_picture,
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return response.status(500).send({ error: 'Server Error' });
    }
});

app.post('/submitForm', async (request, response) => {
  const {
    email,
    full_name,
    phone_number,
    bio,
    city,
    state,
    country,
    profile_picture,
    professional_role,
    skills,
    institution_name,
    highest_education_level,
    year_of_completion,
  } = request.body;

  console.log('Received request payload:', request.body);

  const userProfilePicture = profile_picture || '/FRONTEND/images/default_profile_pic.jpeg';
  
  try {
    // Check if the user already exists
    const isAlreadyExistQuery = `SELECT user_id FROM User WHERE email = ?`;
    const dbUser = await db.get(isAlreadyExistQuery, [email]);

    if (dbUser) {
      // Update role and profile picture if the user already exists
      const updateUserQuery = `UPDATE User SET role = ?, profile_picture = ? WHERE user_id = ?`;
      await db.run(updateUserQuery, [professional_role, userProfilePicture, dbUser.user_id]);
      
      const userId = dbUser.user_id;

      // Insert the profile information
      const insertProfileQuery = `
        INSERT INTO Profile (user_id, name, phone_number, about_me, location, skills)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await db.run(insertProfileQuery, [
        userId,
        full_name,
        phone_number,
        bio,
        `${city}, ${state}, ${country}`,
        skills.join(', ') // Insert skills as a comma-separated string
      ]);

      // Insert skills into the Skills and ProfileSkills table
      for (const skill of skills) {
        // Check if skill already exists
        const checkSkillQuery = `SELECT * FROM Skills WHERE skill_name = ?`;
        const dbSkill = await db.get(checkSkillQuery, [skill]);

        let skillId;
        if (!dbSkill) {
          const insertSkillQuery = `INSERT INTO Skills (skill_name) VALUES (?)`;
          const skillResult = await db.run(insertSkillQuery, [skill]);
          skillId = skillResult.lastID;
        } else {
          skillId = dbSkill.skill_id;
        }

        // Check if the combination of profile_id and skill_id already exists
        const checkProfileSkillQuery = `SELECT * FROM ProfileSkills WHERE profile_id = ? AND skill_id = ?`;
        const dbProfileSkill = await db.get(checkProfileSkillQuery, [userId, skillId]);

        if (!dbProfileSkill) {
          const insertProfileSkillQuery = `INSERT INTO ProfileSkills (profile_id, skill_id) VALUES (?, ?)`;
          await db.run(insertProfileSkillQuery, [userId, skillId]);
        }
      }

      // Insert education information
      const insertEducationQuery = `
        INSERT INTO Education (profile_id, institution, education_level, year_of_completion)
        VALUES (?, ?, ?, ?)
      `;
      await db.run(insertEducationQuery, [userId, institution_name, highest_education_level, year_of_completion]);

      return response.status(200).send({ message: 'Form submitted successfully' });
    } else {
      console.error('User does not exist:', email);
      return response.status(400).send({ error: 'User does not exist' });
    }

  } catch (error) {
    console.error('Error during form submission:', error.message);
    return response.status(500).send({ error: 'Server Error' });
  }
});

app.post('/jobsPostings', async (req, res) => {
  const {
    title,
    category,
    description,
    latitude,
    longitude,
    location,
    posted_on,
    deadline,
    email, // Assuming email is passed in the body to get created_by user_id
    assigned_to, // Optional, can be NULL for now
    status
  } = req.body;

  console.log('Received job posting request:', req.body);
  try {
    // Query to find the created_by (user_id) using email or any unique identifier
    const getUserQuery = `SELECT user_id FROM User WHERE email = ?`;
    const userRow = await db.get(getUserQuery, [email]);
    console.log('User row:', userRow);
    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const created_by = userRow.user_id;
    const finalAssignedTo = assigned_to || null; // Use null if not assigned

    // Insert job with created_by, and optionally assigned_to
    const query = `
      INSERT INTO Jobs 
      (title, category, description, latitude, longitude, location, posted_on, deadline, created_by, assigned_to, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title, 
      category, 
      description, 
      latitude, 
      longitude, 
      location, 
      posted_on, 
      deadline, 
      created_by, 
      finalAssignedTo,
      status
    ];

    const result = await db.run(query, values);
    
    res.status(201).json({ job_id: result.lastID, created_by });
  } catch (err) {
    console.error('Error during job posting:', err.message);
    res.status(400).json({ error: err.message });
  }
});


// Promisify db.all
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
          if (err) {
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
}

app.get('/allJobs', async (req, res) => {
  const query = 'SELECT * FROM Jobs;';
  
  try {
    console.log('Request received for all jobs');
    const rows = await db.all(query);
    
    if (rows && rows.length > 0) {
      console.log('Jobs fetched:', rows);
      res.json(rows);
    } else {
      console.log('No jobs found.');
      res.status(404).json({ message: 'No jobs found' });
    }
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get('/allJobs/:id/', async (request, response) => {
  const {id} = request.params
 
  const getUserIdQuery = `SELECT * FROM Jobs WHERE job_id='${id}';`
  const row = await db.get(getUserIdQuery)
  if (!row) {
    return response.status(404).json({ error: 'Job not found' });
}

const createdByQuery = `SELECT email FROM User WHERE user_id ='${row.created_by}';`
const createdByRow = await db.get(createdByQuery);
if (!createdByRow) {
  return response.status(404).json({ error: 'user not found' });
}


let assignedToEmail = null;
        if (row.assigned_to) {
            const assignedToQuery = `SELECT email FROM User WHERE user_id = '${row.assigned_to}';`;
            const assignedToRow = await db.get(assignedToQuery);
            assignedToEmail = assignedToRow ? assignedToRow.email : null;
        }

        // Send the job details in the response
        response.json({
            job_id: row.job_id,
            title: row.title,
            category: row.category,
            description: row.description,
            location: row.location,
            latitude: row.latitude,
            longitude: row.longitude,
            posted_on: row.posted_on,
            deadline: row.deadline,
            created_by_email: createdByRow ? createdByRow.email : null, // Include email of the creator
            assigned_to_email: assignedToEmail, // Include email of the assignee (if assigned)
            status: row.status
        });
  
})

app.post('/filter-jobs', async (req, res) => {
  const { categories } = req.body;

  // Filter out "All" and convert to lowercase for case-insensitive comparison
  const filteredCategories = categories.filter(category => category !== 'All').map(category => category.toLowerCase()); 

  let query = '';
  const queryParams = [];

  if (filteredCategories.length > 0) {
    // Construct the query to use the "IN" clause for multiple categories
    const placeholders = filteredCategories.map(() => 'LOWER(category) LIKE ?').join(' OR '); // Creates `LOWER(category) LIKE ? OR LOWER(category) LIKE ?`
    query = `SELECT * FROM Jobs WHERE ${placeholders}`;
    
    // Add the query parameters (make sure to add '%' around the category values)
    queryParams.push(...filteredCategories.map(category => `%${category}%`)); 
  } else {
    query = 'SELECT * FROM Jobs'; 
  }

  // Log the query and parameters for debugging
  console.log('Filtered Categories:', filteredCategories);
  console.log('Query:', query);
  console.log('Query Parameters:', queryParams);

  try {
    const rows = await db.all(query, queryParams);
    console.log('Rows:', rows);  // Log the rows returned from the query
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/earn-tokens', async (req, res) => {
  const { userId, amount, reason } = req.body;

  // Insert token earning transaction
  await db.run(`INSERT INTO token_transactions (user_id, type, amount, reason) 
                VALUES (?, 'Earned', ?, ?)`, 
               [userId, amount, reason]);

  res.json({ message: "Tokens earned successfully!", tokensEarned: amount });
});


app.post('/spend-tokens', async (req, res) => {
  const { userId, amount, reason } = req.body;

  // Get the total earned tokens for the user
  const earnedTokens = await db.get(`SELECT SUM(amount) AS totalEarned FROM token_transactions 
                                     WHERE user_id = ? AND type = 'Earned'`, [userId]);

  // Get the total spent tokens for the user
  const spentTokens = await db.get(`SELECT SUM(amount) AS totalSpent FROM token_transactions 
                                    WHERE user_id = ? AND type = 'Spent'`, [userId]);

  const currentBalance = (earnedTokens.totalEarned || 0) - (spentTokens.totalSpent || 0);

  if (currentBalance < amount) {
      return res.status(400).json({ message: "Not enough tokens!" });
  }

  // Insert token spending transaction
  await db.run(`INSERT INTO token_transactions (user_id, type, amount, reason) 
                VALUES (?, 'Spent', ?, ?)`, 
               [userId, amount, reason]);

  res.json({ message: "Tokens spent successfully!", tokensRemaining: currentBalance - amount });
});

app.get('/token-balance/:userId', async (req, res) => {
  const { userId } = req.params;

  // Fetch total earned tokens
  const earnedTokens = await db.get(`SELECT COALESCE(SUM(amount), 0) AS totalEarned 
                                     FROM token_transactions 
                                     WHERE user_id = ? AND type = 'Earned'`, [userId]);

  // Fetch total spent tokens
  const spentTokens = await db.get(`SELECT COALESCE(SUM(amount), 0) AS totalSpent 
                                    FROM token_transactions 
                                    WHERE user_id = ? AND type = 'Spent'`, [userId]);

  // Calculate final balance
  const balance = earnedTokens.totalEarned - spentTokens.totalSpent;

  res.json({ 
      userId, 
      totalEarned: earnedTokens.totalEarned, 
      totalSpent: spentTokens.totalSpent, 
      balance 
  });
});

app.get('/getAllTokens/:userId', async (req, res) => {
  const { userId } = req.params;  // Get userId from the request params
  const query = `SELECT * FROM token_transactions WHERE user_id = ?`;

  try {
    console.log('Request received for token transactions for user:', userId);
    const rows = await db.all(query, [userId]);  // Pass the userId as a parameter to avoid SQL injection

    if (rows && rows.length > 0) {
      console.log('Tokens fetched:', rows);
      res.json(rows);  // Send back the fetched rows as JSON
    } else {
      console.log('No tokens found for user:', userId);
      res.status(404).json({ message: 'No tokens found for this user' });
    }
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.post('/insertTokens', async (req, res) => {
  const { userId } = req.body;
  const reason = "Sign Up Bonus"; // Fixed reason for sign-up bonus

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
      INSERT INTO token_transactions (user_id, amount, type, reason, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
  `;

  try {
      await db.run(query, [userId, 50, 'Earned', reason]);
      console.log(`50 tokens inserted for user ${userId} (Reason: ${reason})`);
      res.status(200).json({ message: '50 tokens inserted successfully' });
  } catch (err) {
      console.error('Error inserting tokens:', err.message);
      res.status(500).json({ error: err.message });
  }
});


app.post('/insertTokensForJob', async (req, res) => {
  const { userId } = req.body;
  const reason = "New job application"; // Fixed reason for sign-up bonus

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
      INSERT INTO token_transactions (user_id, amount, type, reason, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
  `;

  try {
      await db.run(query, [userId, 10, 'Earned', reason]);
      console.log(`50 tokens inserted for user ${userId} (Reason: ${reason})`);
      res.status(200).json({ message: '10 tokens inserted successfully' });
  } catch (err) {
      console.error('Error inserting tokens:', err.message);
      res.status(500).json({ error: err.message });
  }
});









function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (angle) => (Math.PI / 180) * angle;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// API: Get all jobs sorted by proximity (returning all fields)
app.get("/jobs/sorted-by-distance", async (req, res) => {
  try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
          return res.status(400).json({ error: "Latitude and Longitude are required!" });
      }

      // Fetch all jobs with full details
      const jobs = await db.all(`SELECT * FROM Jobs`);

      // Compute distances and sort
      const sortedJobs = jobs.map(job => ({
          ...job,
          distance: getDistance(parseFloat(latitude), parseFloat(longitude), job.latitude, job.longitude)
      })).sort((a, b) => a.distance + b.distance);

      res.json(sortedJobs);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});





// Gracefully close the database connection when the server is stopped
// process.on('SIGINT', () => {
//   console.log('Closing the database connection.');
//   db.close((err) => {
//     if (err) {
//       console.error('Error closing the database connection:', err.message);
//     } else {
//       console.log('Database connection closed.');
//     }
//     process.exit(0);
//   });
// });




