import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const AssignPersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [assignedDate, setAssignedDate] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/shifts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: user?.isSuperUser ? {} : { department_id: user.departmentId },
      });
      setShiftsList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      alert("Error fetching shifts. Check your backend or token.");
    }
  };

  const fetchPersonnel = async (shiftId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/shifts/personnel?shiftId=${shiftId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPersonnelList(response.data);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      alert("Error fetching personnel. Check your backend or token.");
    }
  };

  const handleSelectShift = (shiftId) => {
    if (shiftId === selectedShiftId) {
      setSelectedShiftId(null);
      setPersonnelList([]);
    } else {
      setSelectedShiftId(shiftId);
      fetchPersonnel(shiftId);
    }
  };

  const handleSelectPersonnel = (id) => {
    const isAlreadySelected = selectedPersonnel.find((person) => person.personnel_id === id);
    if (!isAlreadySelected) {
      const selected = personnelList.find((person) => person.personnel_id === id);
      setSelectedPersonnel([...selectedPersonnel, selected]);
      setPersonnelList(personnelList.filter((person) => person.personnel_id !== id));
    }
  };

  const handleDeselectPersonnel = (id) => {
    const deselected = selectedPersonnel.find((person) => person.personnel_id === id);
    setPersonnelList([...personnelList, deselected]);
    setSelectedPersonnel(selectedPersonnel.filter((person) => person.personnel_id !== id));
  };

  const handleAssignShift = async () => {
    if (!selectedShiftId || !assignedDate || selectedPersonnel.length === 0) {
      alert("Please fill all fields and select at least one personnel.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/shifts/${selectedShiftId}/assign`,
        {
          personnelIds: selectedPersonnel.map((person) => person.personnel_id),
          assignedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Shift assigned successfully!");
      setSelectedPersonnel([]);
    } catch (error) {
      console.error("Error assigning shift:", error);
      alert("Error assigning shift.");
    }
  };

  function formatTime(dateTimeString) {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    if (isNaN(date)) return dateTimeString; // Eğer geçersiz bir tarihse olduğu gibi döndür
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return (
    <div style={{ padding: "1.5rem",  margin: "auto" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", backgroundColor: "#fff" }}>
      <h4
       style={{
        marginBottom: "1.5rem",
        textAlign: "center",
        fontWeight: "bold",
      }}
      >Personnel Assignment</h4>
      <div className="list-group">
        {shiftsList.map((shift) => (
          <div key={shift.id} className="mb-3">
            <button
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                selectedShiftId === shift.id ? "active" : ""
              }`}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                backgroundColor: selectedShiftId === shift.id ? "#1a7f64" : "#fff",
                color: selectedShiftId === shift.id ? "#fff" : "#000",
              }}
              onClick={() => handleSelectShift(shift.id)}
            >
              <span>
      {shift.title}{" "}
      <small>
        ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
      </small>
    </span>
              <i className={`bi ${selectedShiftId === shift.id ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
            </button>
            {selectedShiftId === shift.id && (
              <div className="mt-3" style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <h5>Available Personnel</h5>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search available personnel..."
                      value={searchAvailable}
                      onChange={(e) => setSearchAvailable(e.target.value)}
                    />
                    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "10px" }}>
                      <ul className="list-group">
                        {personnelList
                          .filter((person) =>
                            `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchAvailable.toLowerCase())
                          )
                          .map((person) => (
                            <li
                              key={person.personnel_id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                              onClick={() => handleSelectPersonnel(person.personnel_id)}
                              style={{ cursor: "pointer" }}
                            >
                              {person.first_name} {person.last_name}
                              <span className="badge bg-primary">Select</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5>Selected Personnel</h5>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search selected personnel..."
                      value={searchSelected}
                      onChange={(e) => setSearchSelected(e.target.value)}
                    />
                    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "10px" }}>
                      <ul className="list-group">
                        {selectedPersonnel
                          .filter((person) =>
                            `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchSelected.toLowerCase())
                          )
                          .map((person) => (
                            <li
                              key={person.personnel_id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                              onClick={() => handleDeselectPersonnel(person.personnel_id)}
                              style={{ cursor: "pointer" }}
                            >
                              {person.first_name} {person.last_name}
                              <span className="badge bg-danger">Remove</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label">Assign Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                  />
                  <button className="btn btn-success mt-3" onClick={handleAssignShift}>
                    Assign Shift
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

export default AssignPersonnel;
