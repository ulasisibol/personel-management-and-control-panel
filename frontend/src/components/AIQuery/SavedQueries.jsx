import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

// Function to format datetime strings
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "N/A";
  const date = new Date(dateTimeString);
  if (isNaN(date)) return dateTimeString;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

const SavedQueries = () => {
  const location = useLocation();
  const { id } = useParams();
  const [queryResult, setQueryResult] = useState(null); // Query result
  const [query, setQuery] = useState(location.state?.query || ""); // Query state
  const [loading, setLoading] = useState(true); // Loading state
  const [showNoData, setShowNoData] = useState(false); // Show "No Data" message

  // Fetch query from backend (if `query` is empty)
  useEffect(() => {
    const fetchQuery = async () => {
      if (!query && id) {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:3000/api/openai/query/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setQuery(response.data.query);
        } catch (error) {
          console.error("Error fetching query by ID:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchQuery();
  }, [id, query]);

  // Execute query and fetch results
  useEffect(() => {
    const fetchQueryResult = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setShowNoData(false);
      try {
        const response = await axios.post(
          "http://localhost:3000/api/openai/execute-query",
          { query },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setQueryResult(response.data);
      } catch (error) {
        console.error("Error fetching query result:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQueryResult();
  }, [query]);

  // Show "No Data" message after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!queryResult) {
        setShowNoData(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [queryResult]);

  return (
    <div className="container mt-4">
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", backgroundColor: "#fff" }}>
        <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>Query Results</h4>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Table Display */}
        {!loading && queryResult && Array.isArray(queryResult.columns) && Array.isArray(queryResult.data) ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {queryResult.columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {queryResult.columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        {typeof row[col] === "string" && row[col].includes("T")
                          ? formatDateTime(row[col])
                          : row[col] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && showNoData && (
            <div className="alert alert-warning text-center">No data available to display.</div>
          )
        )}
      </div>
    </div>
  );
};

export default SavedQueries;
