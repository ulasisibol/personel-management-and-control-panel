import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const CreateAnnouncement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState(""); // New field
  const [announcementText, setAnnouncementText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      if (user?.isSuperUser) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/departments/list", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Received departments:", response.data); // Check the received data
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
          title: announcementTitle, // Title being sent here
          content: announcementText, // Content being sent here
          departments: user.isSuperUser ? selectedDepartments : [user.departmentId],
          isFromDepartment: !user.isSuperUser,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Announcement created successfully.");
      setAnnouncementText("");
      setAnnouncementTitle("");
      setSelectedDepartments([]);
    } catch (error) {
      console.error(error.response?.data || "Announcement creation failed.");
      setErrorMessage(error.response?.data?.message || "Announcement creation failed.");
    }
  };

  const handleDepartmentSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.departman_adi &&
      dept.departman_adi.toLowerCase().includes(searchQuery)
  );

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((deptId) => deptId !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <div className="container mt-4">
      <h3>Create Announcement</h3>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="mb-3">
          <label htmlFor="announcementTitle" className="form-label">
            Announcement Title
          </label>
          <input
            type="text"
            id="announcementTitle"
            className="form-control"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />
        </div>

        {/* Textarea Input */}
        <div className="mb-3">
          <label htmlFor="announcementText" className="form-label">
            Announcement Text
          </label>
          <textarea
            id="announcementText"
            className="form-control"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows="4"
            required
          />
        </div>

        {/* Department Selection */}
        {user?.isSuperUser && (
          <div className="mb-3">
            <label htmlFor="departmentSearch" className="form-label">
              Search Department
            </label>
            <input
              type="text"
              id="departmentSearch"
              className="form-control mb-3"
              placeholder="Search department..."
              value={searchQuery}
              onChange={handleDepartmentSearch}
            />
            <div>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <div key={dept.departman_id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`dept-${dept.departman_id}`}
                      checked={selectedDepartments.includes(dept.departman_id)}
                      onChange={() => handleCheckboxChange(dept.departman_id)}
                    />
                    <label
                      htmlFor={`dept-${dept.departman_id}`}
                      className="form-check-label"
                    >
                      {dept.departman_adi || "Unnamed Department"}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-muted">No department found.</p>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Create Announcement
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;
