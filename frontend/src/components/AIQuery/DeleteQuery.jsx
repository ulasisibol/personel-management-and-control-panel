import React, { useState, useEffect } from "react";
import axios from "axios";

const DeleteQuery = () => {
  const [queries, setQueries] = useState([]); // List of queries
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [successMessage, setSuccessMessage] = useState(null); // Success message

  // Fetch the list of queries
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/openai/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setQueries(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching queries:", error.message);
        setError("Failed to fetch queries.");
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  // Delete a query
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/openai/query/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update the list of queries
      setQueries(queries.filter((query) => query.id !== id));
      setSuccessMessage("Query deleted successfully!");
    } catch (error) {
      console.error("Error deleting query:", error.message);
      alert("Failed to delete query.");
    }
  };

  return (
    <div className="container mt-4">
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", backgroundColor: "#fff" }}>
        <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>Delete Saved Queries</h4>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* Success Message */}
        {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}

        {/* Query List */}
        {!loading && !error && queries.length > 0 ? (
          <ul className="list-group">
            {queries.map((query) => (
              <li
                key={query.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                style={{
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <span>{query.title}</span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(query.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <div className="alert alert-warning text-center">No queries found.</div>
        )}
      </div>
    </div>
  );
};

export default DeleteQuery;
