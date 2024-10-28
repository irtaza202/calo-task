import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // const createJob = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post("http://localhost:5000/jobs");
  //     fetchJobs();
  //   } catch (error) {
  //     console.error("Error creating job:", error);
  //     setError("Error creating job. Please check the console.");
  //   }
  //   setLoading(false);
  // };

  // Function to create a new job with a retry mechanism
  const createJobWithRetry = async (retries = 3) => {
    setLoading(true); // Show loading when creating job
    try {
      await axios.post("http://localhost:5000/jobs");
      fetchJobs(); // Fetch the updated job list after creating a new job
    } catch (error) {
      if (retries > 0) {
        console.error("Error creating job, retrying...", error);
        setTimeout(() => createJobWithRetry(retries - 1), 1000); // Retry after 1 second
      } else {
        setError("Error creating job. Please check the console.");
      }
    }
    setLoading(false); // Stop loading
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error fetching jobs. Please check the console.");
    }
  };

  const fetchJobById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/jobs/${id}`);
      setSelectedJob(response.data);
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Error fetching job. Please check the console.");
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Job Tracker</h1>
      <button onClick={createJobWithRetry} disabled={loading}>
        {loading ? "Creating Job..." : "Create New Job"}
      </button>
      {error && <p className="error">{error}</p>}

      <div className="jobContainer">
        <div className="jobList">
          <h1>Jobs List</h1>
          {jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <ul>
              {jobs.map((job) => (
                <li key={job.id}>
                  <p>
                    <strong>Job ID:</strong> {job.id}
                  </p>
                  <p>
                    <strong>Status:</strong> {job.status}
                  </p>
                  {job.status === "resolved" && (
                    <img
                      src={job.result}
                      alt={`Job ${job.id} result`}
                      className="jobImage"
                    />
                  )}
                  {job.status !== "pending" && (
                    <button onClick={() => fetchJobById(job.id)}>
                      View Job {job.id}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="jobDetails">
          <h2>Selected Job</h2>
          {selectedJob ? (
            <div className="selectedJob">
              <p>
                <strong>Job ID:</strong> {selectedJob.id}
              </p>
              <p>
                <strong>Status:</strong> {selectedJob.status}
              </p>
              {selectedJob.result && (
                <img
                  src={selectedJob.result}
                  alt={`Job ${selectedJob.id} result`}
                  className="selectedJobImage"
                />
              )}
            </div>
          ) : (
            <p>Please select a job to view its details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
