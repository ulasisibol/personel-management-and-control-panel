import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const ShiftList = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem("token");
  
        // If not admin, filter by department_id
        const response = await axios.get("http://localhost:3000/api/shifts", {
          headers: { Authorization: `Bearer ${token}` },
          params: user?.isSuperUser ? {} : { department_id: user.departmentId }, // If admin, send empty params
        });
  
        setShifts(response.data.data);
      } catch (error) {
        console.error("Failed to fetch shift list:", error.message);
        setErrorMessage("Failed to fetch shift list.");
      }
    };
  
    fetchShifts();
  }, [user]);
  
  return (
    <div className="container mt-4">
      <h3>Shifts</h3>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Start</th>
            <th>End</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.title}</td>
              <td>{shift.start_time}</td>
              <td>{shift.end_time}</td>
              <td>{shift.department_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftList;
