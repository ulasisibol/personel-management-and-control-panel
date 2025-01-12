import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const CreateAnnouncement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      if (user?.isSuperUser) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:3000/api/departments/list",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setDepartments(response.data);
        } catch (error) {
          console.error("Failed to retrieve department list:", error);
          setErrorMessage("Failed to retrieve department list.");
        }
      }
    };
    fetchDepartments();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!announcementText.trim() || !announcementTitle.trim()) {
      setErrorMessage("Title and announcement text cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/announcements/create",
        {
          title: announcementTitle,
          content: announcementText,
          departments: user.isSuperUser ? [selectedDepartmentId] : [user.departmentId],
          isFromDepartment: !user.isSuperUser,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Announcement created successfully.");
      setAnnouncementText("");
      setAnnouncementTitle("");
      setSelectedDepartmentId("");
    } catch (error) {
      console.error(error.response?.data || "Announcement creation failed.");
      setErrorMessage(error.response?.data?.message || "Announcement creation failed.");
    }
  };

  return (
    <div className="container mt-4">
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="announcement-form">
        <div className="form-group">
          <label htmlFor="announcementTitle">Announcement Title</label>
          <input
            type="text"
            id="announcementTitle"
            className="form-control"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="announcementText">Announcement Text</label>
          <textarea
            id="announcementText"
            className="form-control"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows="4"
            required
          />
        </div>
        {user?.isSuperUser && (
          <div className="form-group">
            <label htmlFor="departmentSelect">Department</label>
            <select
              id="departmentSelect"
              className="form-select"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((dept) => (
                <option key={dept.departman_id} value={dept.departman_id}>
                  {dept.departman_adi || "Unnamed Department"}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-block">
          Create Announcement
        </button>
      </form>
      <style jsx>{`
        .container {
          background-color: white;
          color: black !important;
          margin: auto;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .form-title {
          text-align: center;
          margin-bottom: 20px;
        }
        .announcement-form .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
        }
        .form-control,
        .form-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #007bff;
          box-shadow: 0px 0px 4px rgba(0, 123, 255, 0.5);
          outline: none;
        }
        .btn-primary {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #10a37f;
        }
        .alert {
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
        }
        .alert-success {
          color: #155724;
          background-color: #d4edda;
          border-color: #c3e6cb;
        }
        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
        #announcementText{
          min-height: 250px !important;

        }
      `}</style>
    </div>
  );
};

export default CreateAnnouncement;
