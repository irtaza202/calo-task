const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { createApi } = require("unsplash-js");
const nodeFetch = require("node-fetch");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let jobs = require("./jobs.json");

const unsplash = createApi({
  accessKey: "QMnWBMkxGgg0Mb_1gZOXuq1NFn0lyIU3pgEnOMrNkW8",
  fetch: nodeFetch,
});

// Helper function to save jobs to the JSON file
const saveJobs = () => {
  fs.writeFileSync("./jobs.json", JSON.stringify(jobs, null, 2));
};

// Endpoint to get all jobs
app.get("/jobs", (req, res) => {
  res.json(
    jobs.map((job) => ({
      id: job.id,
      status: job.status,
      result: job.status === "resolved" ? job.result : null, // Only return result if resolved
    }))
  );
});

// Endpoint to create a new job
app.post("/jobs", (req, res) => {
  const newJob = {
    id: jobs.length + 1,
    status: "pending",
    result: null,
  };

  jobs.push(newJob);
  saveJobs();
  res.status(201).json({ id: newJob.id });
});

// Endpoint to get a specific job by id
app.get("/jobs/:id", (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json({
    id: job.id,
    status: job.status,
    result: job.status === "resolved" ? job.result : null, // Return result only if resolved
  });
});

// Function to fetch a random food image from Unsplash and update the job
const fetchRandomFoodImage = async (job) => {
  try {
    const response = await unsplash.photos.getRandom({
      query: "food",
      orientation: "landscape",
    });

    if (response && response.response && response.response.urls) {
      job.status = "resolved";
      job.result = response.response.urls.regular; // Save the image URL
    } else {
      job.status = "failed";
    }
  } catch (error) {
    job.status = "failed";
    console.error("Error fetching image from Unsplash:", error);
  }
  saveJobs();
};

// Simulate job resolution by updating jobs after a random time
const resolveJob = (job) => {
  setTimeout(async () => {
    if (Math.random() > 0.5) {
      await fetchRandomFoodImage(job);
    } else {
      job.status = "failed";
      saveJobs();
    }
  }, Math.floor(Math.random() * 300 + 5) * 1000); // Random delay between 5s (5 * 1000 ms) and 5 min (300 * 1000 ms)
};

// Periodically check for pending jobs and resolve them
setInterval(() => {
  jobs.forEach((job) => {
    if (job.status === "pending") {
      resolveJob(job);
    }
  });
}, 5000); // Check every 5 seconds for pending jobs

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
