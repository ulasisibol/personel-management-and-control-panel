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
        setDepartments(response.data || []);
      } catch (error) {
        setErrorMessage("Failed to fetch departments. Please try again.");
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !departmentId || !startTime || !endTime) {
      setErrorMessage("Please fill out all fields.");
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
      setErrorMessage("Failed to create shift. Please try again.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "1.5rem",  margin: "auto" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", backgroundColor: "#fff" }}>
        <h4 
        style={{
          marginBottom: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
        >Create Shift</h4>
        {successMessage && (
          <div className="alert alert-success text-center mb-3">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger text-center mb-3">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Shift Title */}
          <div className="mb-3">
            <label className="form-label">Shift Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter shift title"
              required
            />
          </div>

          {/* Department Selection */}
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

          {/* Start Time */}
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

          {/* End Time */}
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

          {/* Submit Button */}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary"
                            style={{ alignSelf: 'center', backgroundColor: "#1a7f64", padding: "5px 10px 5px 10px", fontSize: "17px" }}

            >
              Create Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShift;
