import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const UpdateShift = () => {
  const { user } = useAuth();
  const [shiftsList, setShiftsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    department_id: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchShifts();
    fetchDepartments();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get("/api/shifts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: user?.isSuperUser ? {} : { department_id: user.departmentId },
      });
      setShiftsList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      alert("Error fetching shifts. Check your backend or token.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/departments/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Error fetching departments. Check your backend or token.");
    }
  };

  const handleEditClick = (shift) => {
    setSelectedShift(shift);
    setFormData({
      title: shift.title,
      department_id: shift.department_id,
      start_time: shift.start_time.slice(11, 16), // Saat formatı: 00:00
      end_time: shift.end_time.slice(11, 16), // Saat formatı: 00:00
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.put(`/api/shifts/${selectedShift.id}/update`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Shift updated successfully!");
      fetchShifts(); // Listeyi güncelle
      setSelectedShift(null); // Düzenleme alanını kapat
    } catch (error) {
      console.error("Error updating shift:", error);
      alert("Error updating shift. Check your input and try again.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}>
      <h4
      style={{
        marginBottom: "1.5rem",
        textAlign: "center",
        fontWeight: "bold",
      }}
      >Update Shifts</h4>
      <div>
        {shiftsList.map((shift) => (
          <div
            key={shift.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h6 style={{ margin: 0 }}>{shift.title}</h6>
                <small>
                  {shift.start_time.slice(11, 16)} - {shift.end_time.slice(11, 16)} (Department:{" "}
                  {shift.department_name || "Unknown"})
                </small>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'center', backgroundColor: "#1a7f64", padding: "5px 10px 5px 10px", fontSize: "17px" }}
                onClick={() => handleEditClick(shift)}
              >
                Edit
              </button>
            </div>

            {selectedShift?.id === shift.id && (
              <div style={{ marginTop: "1rem" }}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  {user?.isSuperUser ? (
                    <select
                      className="form-select"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.departman_id} value={dept.departman_id}>
                          {dept.departman_adi}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={
                        departments.find((d) => d.departman_id === user.departmentId)?.departman_adi ||
                        "No Department"
                      }
                      readOnly
                    />
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedShift(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default UpdateShift;
