import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth"; // Admin doğrulama için kullanıcı bağlamı

// Tarih ve saati istenilen formata dönüştüren işlev
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

const CreateQuery = () => {
  const { user } = useAuth(); // Kullanıcı bilgilerini al
  const [naturalQuery, setNaturalQuery] = useState(""); // Kullanıcıdan doğal sorgu al
  const [generatedSQL, setGeneratedSQL] = useState(""); // OpenAI'dan dönen SQL
  const [executionResult, setExecutionResult] = useState(null); // AI Transformed Result
  const [error, setError] = useState(null);

  // Admin kontrolü
  useEffect(() => {
    if (!user?.isSuperUser) {
      alert("Bu sayfaya yalnızca admin kullanıcılar erişebilir.");
      window.location.href = "/dashboard"; // Yetkisiz kullanıcıyı yönlendirme
    }
  }, [user]);

  // Doğal dil sorgusu oluşturma ve otomatik çalıştırma
  const handleGenerateAndExecuteSQL = async () => {
    if (!naturalQuery) {
      alert("Lütfen bir doğal sorgu girin.");
      return;
    }

    try {
      // Doğal dil sorgusu ile SQL oluştur
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
      setGeneratedSQL(sqlQuery); // Oluşturulan SQL'i kaydet

      // SQL sorgusunu otomatik çalıştır
      const executeResponse = await axios.post(
        "http://localhost:3000/api/openai/execute-query",
        { query: sqlQuery },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setExecutionResult(executeResponse.data); // AI Transformed Result'ı kaydet
      setError(null);
    } catch (error) {
      console.error("Hata:", error);
      setError("Bir hata oluştu. Lütfen sorgunuzu kontrol edin.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Doğal Dil Sorgusu Çalıştır</h2>

      {/* Doğal Sorgu Girişi */}
      <div className="card my-4">
        <div className="card-body">
          <h5 className="card-title">Doğal Sorgu Oluştur ve Çalıştır</h5>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Örn: 'Betty'nin tüm tatillerini getir'"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
          ></textarea>
          <button className="btn btn-primary mt-3" onClick={handleGenerateAndExecuteSQL}>
            Sorguyu Çalıştır
          </button>
        </div>
      </div>

      {/* Oluşturulan SQL Gösterimi */}
      {generatedSQL && (
        <div className="card my-4">
          <div className="card-body">
            <h5 className="card-title">Oluşturulan SQL</h5>
            <pre>{generatedSQL}</pre>
          </div>
        </div>
      )}

      {/* Çalıştırma Sonuçları */}
      {executionResult && (
        <div className="card my-4">
          <div className="card-body">
            <h5 className="card-title">Sonuçlar</h5>
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
                          ? formatDateTime(row[col]) // Tarih ve saat formatını uygula
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

      {/* Hata Mesajı */}
      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateQuery;
