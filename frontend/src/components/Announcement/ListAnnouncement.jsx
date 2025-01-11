import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const ListAnnouncement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [republishId, setRepublishId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          setAnnouncements(response.data.data);
        } else {
          setErrorMessage("Received data in an unexpected format.");
        }
      } catch (error) {
        console.error("Error fetching announcement list:", error.message);
        setErrorMessage("An error occurred while fetching the announcement list.");
      }
    };

    const fetchDepartments = async () => {
      if (user?.isSuperUser) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/departments/list", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDepartments(response.data);
        } catch (error) {
          console.error("Failed to retrieve department list:", error);
        }
      }
    };

    fetchAnnouncements();
    fetchDepartments();
  }, [user]);

  const handleRepublish = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/announcements/republish",
        {
          announcementId: republishId,
          target_departments: selectedDepartments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Announcement republished successfully.");
      setRepublishId(null);
      setSelectedDepartments([]);
    } catch (error) {
      console.error("Announcement could not be republished:", error);
      setErrorMessage("Announcement could not be republished.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((deptId) => deptId !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <div className="container mt-4">
      <h3>Announcement List</h3>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <div className="list-group">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="list-group-item">
              <p>
                <strong>Title:</strong> {announcement.title}
              </p>
              <p>
                <strong>Content:</strong> {announcement.content}
              </p>
              <p>
                <strong>Creation Date:</strong>{" "}
                {new Date(announcement.created_at).toLocaleString()}
              </p>

              {user?.isSuperUser && (
                <div>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => setRepublishId(announcement.id)}
                  >
                    Republish
                  </button>

                  {republishId === announcement.id && (
                    <div className="mt-3">
                      <label htmlFor="departments">Select Department:</label>
                      <div className="mb-2">
                        {departments.map((dept) => (
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
                              {dept.departman_adi}
                            </label>
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleRepublish}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="alert alert-info">There are no announcements yet.</div>
        )}
      </div>
    </div>
  );
};

export default ListAnnouncement;
