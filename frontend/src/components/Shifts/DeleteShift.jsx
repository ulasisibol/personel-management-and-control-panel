import React, { useState, useEffect } from "react";
import axios from "axios";

const DeleteShift = () => {
  const [shiftsList, setShiftsList] = useState([]);

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
      alert("Error fetching shifts.");
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await axios.delete(`/api/shifts/${shiftId}/delete`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Shift deleted successfully!");
        fetchShifts(); // Güncel listeyi çek
      } catch (error) {
        console.error("Error deleting shift:", error);
        alert("Error deleting shift.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Shifts</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shiftsList.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.title}</td>
              <td>{shift.department_name}</td>
              <td>{shift.start_time}</td>
              <td>{shift.end_time}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteShift(shift.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeleteShift;
