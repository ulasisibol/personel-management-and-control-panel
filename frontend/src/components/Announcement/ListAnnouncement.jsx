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
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
      setSuccessMessage("Announcement deleted successfully.");
    } catch (error) {
      console.error("Error deleting announcement:", error.message);
      setErrorMessage("Failed to delete announcement.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((deptId) => deptId !== id)
        : [...prevSelected, id]
    );
  };

  const toggleExpand = (id) => {
    if (expandedAnnouncement !== id) {
      setSelectedDepartments([]);
    }
    setExpandedAnnouncement((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="container mt-4">
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <div className="announcement-list">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="announcement-item"
              onClick={() => toggleExpand(announcement.id)}
            >
              <div className="announcement-header">
                <span className="announcement-title">{announcement.title}</span>
                {user?.isSuperUser && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(announcement.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              {expandedAnnouncement === announcement.id && (
                <div
                  className="announcement-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p>{announcement.content}</p>
                  <p>
                    <strong>Creation Date:</strong>{" "}
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                  {user?.isSuperUser && (
                    <div>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRepublishId(announcement.id);
                        }}
                      >
                        Republish
                      </button>
                      {republishId === announcement.id && (
                        <div className="republish-section">
                          <label>Select Department:</label>
                          {departments.map((dept) => (
                            <div key={dept.departman_id} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedDepartments.includes(dept.departman_id)}
                                onChange={() => handleCheckboxChange(dept.departman_id)}
                              />
                              <label className="form-check-label">
                                {dept.departman_adi}
                              </label>
                            </div>
                          ))}
                          <button
                            className="btn btn-warning btn-sm mt-3"
                            onClick={handleRepublish}
                          >
                            Submit
                          </button>
                        </div>
                      )}
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

      <style jsx>{`
        .announcement-item {
          background: #fff;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 12px;
          cursor: pointer;
        }
        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .announcement-title {
          font-weight: 600;
        }
        .announcement-content {
          margin-top: 12px;
        }
        .republish-section {
          margin-top: 12px;
        }
        .btn-warning {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-warning:hover {
          background-color: #10a37f;
        }
        .btn-danger {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-danger:hover {
          background-color: #2da485;
        }
      `}</style>
    </div>
  );
};

export default ListAnnouncement;
