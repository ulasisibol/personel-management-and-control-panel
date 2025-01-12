import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const ShiftList = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShifts, setFilteredShifts] = useState([]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/api/shifts", {
          headers: { Authorization: `Bearer ${token}` },
          params: user?.isSuperUser ? {} : { department_id: user.department_id },
        });

        if (response.data.success) {
          setShifts(response.data.data);
          setFilteredShifts(response.data.data);
        } else {
          setErrorMessage("Failed to fetch shift list.");
        }
      } catch (error) {
        console.error("Failed to fetch shift list:", error.message);
        setErrorMessage("An error occurred while fetching the shift list.");
      }
    };

    if (user) {
      fetchShifts();
    }
  }, [user]);

  const formatTime = (isoTime) => {
    if (!isoTime) return "-";
    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = shifts.filter((shift) => {
      const title = shift.title?.toLowerCase() || "";
      const departmentName = shift.department_name?.toLowerCase() || "";
      return title.includes(query) || departmentName.includes(query);
    });

    setFilteredShifts(filtered);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Shift List
        </h4>

        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search shifts..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        {filteredShifts.length > 0 ? (
          <div>
            {filteredShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  cursor: "pointer",
                }}
              >
                {/* Shift Info */}
                <div>
                  <h6 style={{ margin: 0 }}>{shift.title}</h6>
                  <small>{shift.department_name || "Unknown"}</small>
                </div>

                {/* Shift Timing */}
                <div>
                  <small>
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">No shifts available.</div>
        )}
      </div>
    </div>
  );
};

export default ShiftList;
