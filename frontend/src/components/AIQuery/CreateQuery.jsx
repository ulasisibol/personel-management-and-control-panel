import React, { useState, useEffect } from "react";
import axios from "axios";

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const CreateQuery = () => {
  const [naturalQuery, setNaturalQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(""); // For department dropdown
  const [departments, setDepartments] = useState([]); // Dropdown options
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/departments/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error.message);
        setError("Failed to fetch departments.");
      }
    };

    fetchDepartments();
  }, []);

  const handleGenerateAndExecuteSQL = async () => {
    if (!naturalQuery) {
      alert("Please enter a natural query.");
      return;
    }

    try {
      const generateResponse = await axios.post(
        "http://localhost:3000/api/openai/natural-query",
        { naturalQuery },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const sqlQuery = generateResponse.data.query;
      setGeneratedSQL(sqlQuery);

      const executeResponse = await axios.post(
        "http://localhost:3000/api/openai/execute-query",
        { query: sqlQuery },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setExecutionResult(executeResponse.data);
      setError(null);
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while processing the query. Please check your input.");
    }
  };

  const handleSaveQuery = async () => {
    if (!title || !generatedSQL) {
      alert("Please provide a title and generate a query.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/openai/save",
        {
          title,
          query: generatedSQL,
          department_id: department || null,
          isPublic: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Query saved successfully!");
      setTitle("");
      setDepartment("");
    } catch (error) {
      console.error("Error saving query:", error.message);
      setSaveError("Failed to save query.");
    }
  };

  return (
    <div style={{ padding: "1.5rem", margin: "auto" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", backgroundColor: "#fff" }}>
        <h4 style={{ marginBottom: "1rem", textAlign: "center" }}>Natural Language Query Executor</h4>

        {/* Natural Query Input */}
        <div className="mb-4">
          <textarea
            className="form-control"
            rows="3"
            placeholder="E.g., 'Get all vacations of Betty'"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
          ></textarea>
          <button className="btn btn-primary mt-3 w-100" onClick={handleGenerateAndExecuteSQL}
          style={{backgroundColor: "#1a7f64"}}
          >
            Execute Query
          </button>
        </div>

        {generatedSQL && (
          <div className="card my-4">
            <div className="card-body">
              <h5 className="card-title">Generated SQL</h5>
              <pre style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px" }}>{generatedSQL}</pre>

              <div className="d-flex align-items-center mt-3">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Enter a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <select
                  className="form-select me-2"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departman_id} value={dept.departman_id}>
                      {dept.departman_adi}
                    </option>
                  ))}
                </select>
                <button className="btn btn-success" onClick={handleSaveQuery}>
                  Save Query
                </button>
              </div>
              {saveError && (
                <div className="alert alert-danger mt-3">{saveError}</div>
              )}
            </div>
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div className="card my-4">
            <div className="card-body">
              <h5 className="card-title">Results</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {executionResult.columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionResult.data.map((row, index) => (
                    <tr key={index}>
                      {executionResult.columns.map((col, i) => (
                        <td key={i}>
                          {typeof row[col] === "string" && row[col].includes("T")
                            ? formatDateTime(row[col])
                            : row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-4 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};


export default CreateQuery;
