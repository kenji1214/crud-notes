import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://y5xmx0delj.execute-api.eu-west-1.amazonaws.com/prd/items";

function App() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (err) => reject(err);
    });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!id || !name || !imageFile) {
      setError("Please fill in all fields and select an image.");
      return;
    }

    try {
      const base64Image = await convertToBase64(imageFile);

      const payload = {
        id,
        name,
        base64Image,
        mimeType: imageFile.type,
      };

      const res = await axios.put(API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setMessage(res.data.message);
      setId("");
      setName("");
      setImageFile(null);
      setPreviewUrl(null);
      fetchItems();
    } catch (err) {
      console.error("Error creating item:", err);
      setError("Upload failed. Please try again.");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📦 Upload Image to DynamoDB + S3</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.input}
        />

        {previewUrl && (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" style={styles.previewImage} />
          </div>
        )}

        <button type="submit" style={styles.button}>
          Upload
        </button>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <h3 style={styles.subheading}>🖼️ Uploaded Items</h3>
      <div style={styles.cardContainer}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.s3Url} alt={item.name} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Name:</strong> {item.name}</p>
              <p style={styles.cardDate}><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    textAlign: "center",
    color: "#333",
  },
  subheading: {
    marginTop: "40px",
    color: "#444",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  success: {
    color: "green",
  },
  error: {
    color: "red",
  },
  previewContainer: {
    marginTop: "10px",
  },
  previewImage: {
    maxWidth: "150px",
    borderRadius: "6px",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
  },
  cardImage: {
    width: "100%",
    height: "auto",
    borderRadius: "6px",
  },
  cardBody: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
  },
  cardDate: {
    fontSize: "12px",
    color: "#888",
    marginTop: "6px",
  },
};

export default App;