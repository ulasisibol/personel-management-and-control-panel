import React, { useState, useEffect } from "react";
import axios from "axios";

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [personnelId, setPersonnelId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnelList, setFilteredPersonnelList] = useState([]);

  useEffect(() => {
    fetchPersonnel();
    fetchHolidays();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get("/api/holiday/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Personnel Response:", response.data); // Check the incoming response

      if (response.data?.success && Array.isArray(response.data.data)) {
        setPersonnelList(response.data.data); // Main list
        setFilteredPersonnelList(response.data.data); // Filtered list
      } else {
        console.warn("Personnel response is not in the expected format:", response.data);
        setPersonnelList([]);
        setFilteredPersonnelList([]);
        alert("Could not retrieve personnel information.");
      }
    } catch (error) {
      console.error("Error fetching personnel:", error);
      setPersonnelList([]);
      setFilteredPersonnelList([]);
      alert("Could not retrieve personnel information.");
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get("/api/holiday/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHolidays(response.data?.data || []);
    } catch (error) {
      console.error("Could not retrieve holidays:", error);
      alert("Could not retrieve holidays.");
    }
  };

  const handleAddHoliday = async () => {
    if (!personnelId || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        "/api/holiday/create",
        { personnel_id: personnelId, start_date: startDate, end_date: endDate, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Holiday successfully added.");
      fetchHolidays();
      clearForm();
    } catch (error) {
      console.error("Could not add holiday:", error);
      alert("An error occurred while adding the holiday.");
    }
  };

  const handleDeleteHoliday = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this holiday?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/holiday/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Holiday successfully deleted.");
      fetchHolidays();
    } catch (error) {
      console.error("Could not delete holiday:", error);
      alert("An error occurred while deleting the holiday.");
    }
  };

  const clearForm = () => {
    setPersonnelId("");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredPersonnelList(
      personnelList.filter((personnel) =>
        `${personnel.first_name} ${personnel.last_name}`
          .toLowerCase()
          .includes(searchTerm)
      )
    );
  };

  const handleSelectPersonnel = (id) => {
    setPersonnelId(id);
  };

  return (
    <div className="container mt-4">
      <h2>Holiday Management</h2>

      {/* Add Holiday */}
      <div className="card my-4">
        <div className="card-body">
          <h5 className="card-title">Add Holiday</h5>
          <div className="mb-3">
            <label className="form-label">Personnel</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search Personnel..."
              onChange={handleSearch}
            />
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              {filteredPersonnelList.map((personnel) => (
                <div
                  key={personnel.personnel_id}
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <span>
                    {personnel.first_name} {personnel.last_name}
                  </span>
                  <button
                    className={`btn btn-sm ${
                      personnelId === personnel.personnel_id ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => handleSelectPersonnel(personnel.personnel_id)}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            ></textarea>
          </div>
          <button className="btn btn-primary" onClick={handleAddHoliday}>
            Add
          </button>
        </div>
      </div>

      {/* Holiday List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Holiday List</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Personnel</th>
                <th>Start</th>
                <th>End</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => (
                <tr key={holiday.id}>
                  <td>{index + 1}</td>
                  <td>
                    {holiday.first_name} {holiday.last_name}
                  </td>
                  <td>{holiday.start_date}</td>
                  <td>{holiday.end_date}</td>
                  <td>{holiday.description || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;
