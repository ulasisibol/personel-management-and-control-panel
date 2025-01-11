import React, { useState, useEffect } from "react";
import axios from "axios";

const RemovePersonnel = () => {
  const [personnelList, setPersonnelList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [searchAvailable, setSearchAvailable] = useState("");

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

  const fetchPersonnel = async (shiftId) => {
    try {
      const response = await axios.get(`/api/shifts/assigned?shiftId=${shiftId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPersonnelList(response.data.data);
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

  const handleRemovePersonnel = async (id) => {
    if (!id) {
      console.error("PersonnelId is missing or null");
      alert("PersonnelId is missing or null. Cannot proceed.");
      return;
    }
  
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this personnel from the shift?"
    );
    if (!confirmRemove) return;
  
    try {
      console.log("Removing Personnel with Id:", id);
      console.log("ShiftId being used:", selectedShiftId);
  
      // API isteği
      await axios.post(
        `/api/shifts/${selectedShiftId}/remove-personnel`,
        { personnelIds: [id] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      alert("Personnel removed from shift successfully!");
      // Personel listesini güncelle
      setPersonnelList((prev) =>
        prev.filter((person) => person.personnel_id !== id)
      );
    } catch (error) {
      console.error("Error removing personnel from shift:", error);
      alert("Error removing personnel from shift.");
    }
  };
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Remove Personnel from Shift</h2>
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
                backgroundColor: selectedShiftId === shift.id ? "#007bff" : "#fff",
                color: selectedShiftId === shift.id ? "#fff" : "#000",
              }}
              onClick={() => handleSelectShift(shift.id)}
            >
              <span>
                {shift.title} <small>({shift.start_time} - {shift.end_time})</small>
              </span>
              <i className={`bi ${selectedShiftId === shift.id ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
            </button>
            {selectedShiftId === shift.id && (
              <div className="mt-3" style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px" }}>
                <h5>Assigned Personnel</h5>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Search personnel..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                />
                <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "10px" }}>
                  <ul className="list-group">
                    {personnelList
                      .filter((person) =>
                        `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchAvailable.toLowerCase())
                      )
                      .map((person) => (
                        <li
                          key={person.personnel_id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {person.first_name} {person.last_name}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemovePersonnel(person.personnel_id)}
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemovePersonnel;
