import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdateShift = () => {
  const [shiftsList, setShiftsList] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    department_id: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get("/api/shifts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShiftsList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      alert("Error fetching shifts. Check your backend or token.");
    }
  };

  const handleEditClick = (shift) => {
    setSelectedShift(shift);
    setFormData({
      title: shift.title,
      department_id: shift.department_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
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
      setSelectedShift(null); // Modali kapat
    } catch (error) {
      console.error("Error updating shift:", error);
      alert("Error updating shift. Check your input and try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Update Shifts</h2>
      <div className="list-group">
        {shiftsList.map((shift) => (
          <div key={shift.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{shift.title}</strong>
              <br />
              <small>
                {shift.start_time} - {shift.end_time} (Department: {shift.department_id})
              </small>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => handleEditClick(shift)}>
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedShift && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Shift</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setSelectedShift(null)}
                ></button>
              </div>
              <div className="modal-body">
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
                  <label className="form-label">Department ID</label>
                  <input
                    type="number"
                    className="form-control"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                  />
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
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedShift(null)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateShift;
