import React, { useState, useEffect } from "react";
import axios from "axios";

const AbsenteeismManagement = () => {
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnelList, setFilteredPersonnelList] = useState([]);
  const [absenteeismList, setAbsenteeismList] = useState([]);
  const [personnelId, setPersonnelId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPersonnel();
    fetchAbsenteeism();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get("/api/personnel", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Personnel Response:", response.data); // Check the incoming response
  
      // Check if the response is an array
      if (Array.isArray(response.data)) {
        setPersonnelList(response.data); // Main list
        setFilteredPersonnelList(response.data); // Filtered list
      } else {
        console.warn("Personnel response is not in the expected format:", response.data);
        setPersonnelList([]); // Empty the list
        setFilteredPersonnelList([]); // Empty the filtered list
        alert("Could not retrieve personnel information.");
      }
    } catch (error) {
      console.error("Error fetching personnel:", error);
      setPersonnelList([]);
      setFilteredPersonnelList([]);
      alert("Could not retrieve personnel information.");
    }
  };
  const fetchAbsenteeism = async () => {
    try {
      const response = await axios.get("/api/absenteeism/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAbsenteeismList(response.data?.data || []);
    } catch (error) {
      console.error("Could not retrieve absenteeism information:", error);
    }
  };

  const handleAddAbsenteeism = async () => {
    if (!personnelId || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        "/api/absenteeism/create",
        { personnel_id: personnelId, start_date: startDate, end_date: endDate, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Absenteeism successfully added.");
      fetchAbsenteeism();
      clearForm();
    } catch (error) {
      console.error("Error adding absenteeism:", error);
    }
  };

  const handleDeleteAbsenteeism = async (id) => {
    if (!window.confirm("Are you sure you want to delete this absenteeism record?")) return;

    try {
      await axios.delete(`/api/absenteeism/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Absenteeism successfully deleted.");
      fetchAbsenteeism();
    } catch (error) {
      console.error("Error deleting absenteeism:", error);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredPersonnelList(
      personnelList.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm)
      )
    );
  };

  const handleSelectPersonnel = (id) => {
    setPersonnelId(id);
  };

  const clearForm = () => {
    setPersonnelId("");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  return (
    <div className="container mt-4">
      <div className="card my-4">
        <div className="card-body">
        <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Add Absenteeism</h4>
          <div className="mb-3">
            <label>Personnel</label>
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
                  style={{ borderBottom: "1px solid #ddd" }}
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
              {filteredPersonnelList.length === 0 && (
                <div className="text-center text-muted">No personnel found.</div>
              )}
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
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddAbsenteeism}
                    style={{ alignSelf: 'center', backgroundColor: "#1a7f64", width: "400px",alignItems: "center", fontSize: "17px" }}

          >
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Absenteeism List</h5>
          <table className="table">
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
              {absenteeismList.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>{item.description || "-"}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteAbsenteeism(item.id)}
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

export default AbsenteeismManagement;
