import React, { useState, useEffect } from "react";
import axios from "axios";

const ExtraWorkManagement = () => {
  const [extraWorks, setExtraWorks] = useState([]);
  const [personnelId, setPersonnelId] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [extraHours, setExtraHours] = useState("");
  const [description, setDescription] = useState("");
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnelList, setFilteredPersonnelList] = useState([]);

  useEffect(() => {
    fetchPersonnel();
    fetchExtraWorks();
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
  
  const fetchExtraWorks = async () => {
    try {
      const response = await axios.get("/api/extraWork/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setExtraWorks(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching extra works:", error);
      alert("Could not retrieve extra work information.");
    }
  };

  const handleAddExtraWork = async () => {
    if (!personnelId || !workDate || !extraHours) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        "/api/extraWork/create",
        { personnel_id: personnelId, work_date: workDate, extra_hours: extraHours, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Extra work successfully added.");
      fetchExtraWorks();
      clearForm();
    } catch (error) {
      console.error("Error adding extra work:", error);
      alert("An error occurred while adding extra work.");
    }
  };

  const handleDeleteExtraWork = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this extra work record?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/extraWork/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Extra work successfully deleted.");
      fetchExtraWorks();
    } catch (error) {
      console.error("Error deleting extra work:", error);
      alert("An error occurred while deleting extra work.");
    }
  };

  const clearForm = () => {
    setPersonnelId("");
    setWorkDate("");
    setExtraHours("");
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
      {/* Add Extra Work */}
      <div className="card my-4">
        <div className="card-body">
        <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Add Extra Work</h4>
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
                maxHeight: "300px", // Fixed height
                overflowY: "auto", // Add scroll
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
                    borderRadius: "5px",
                  }}
                >
                  <span>{personnel.first_name} {personnel.last_name}</span>
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
            <label className="form-label">Work Date</label>
            <input
              type="date"
              className="form-control"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Extra Hours</label>
            <input
              type="number"
              className="form-control"
              value={extraHours}
              onChange={(e) => setExtraHours(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            ></textarea>
          </div>
          <button className="btn btn-primary" onClick={handleAddExtraWork}
          style={{ alignSelf: 'center', backgroundColor: "#1a7f64", width: "400px",alignItems: "center", fontSize: "17px" }}

          >
            Add
          </button>
        </div>
      </div>

      {/* Extra Work List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Extra Work List</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Personnel</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extraWorks.map((work, index) => (
                <tr key={work.id}>
                  <td>{index + 1}</td>
                  <td>
                    {work.first_name} {work.last_name}
                  </td>
                  <td>{new Date(work.work_date).toLocaleString()}</td>
                  <td>{work.extra_hours}</td>
                  <td>{work.description || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteExtraWork(work.id)}
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

export default ExtraWorkManagement;
