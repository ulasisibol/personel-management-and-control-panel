import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateShift = () => {
  const [departments, setDepartments] = useState([]);
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/departments/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Received Departments:", response.data); // Check the received data
        setDepartments(response.data);
      } catch (error) {
        setErrorMessage("Failed to fetch departments.");
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !departmentId || !startTime || !endTime) {
      setErrorMessage("You must fill out all fields.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/shifts/create",
        { title, department_id: departmentId, start_time: startTime, end_time: endTime },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setSuccessMessage("Shift created successfully.");
      setTitle("");
      setDepartmentId("");
      setStartTime("");
      setEndTime("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to create shift.");
      console.error(error);
    }
  };
  

  return (
    <div className="container mt-4">
      <h3>Create Shift</h3>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Shift Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.departman_id} value={dept.departman_id}>
                {dept.departman_adi || "Department Name Missing"}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Time</label>
          <input
            type="time"
            className="form-control"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Shift
        </button>
      </form>
    </div>
  );
};

export default CreateShift;
