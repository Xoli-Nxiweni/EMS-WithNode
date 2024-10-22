import { collection, addDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
// import { getAuth } from "firebase/auth"; // No need to log in new admins
import { db } from "../../firebase";
import './Admins.css';
import { MdAdd } from 'react-icons/md';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [addAdminError, setAddAdminError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "admins"));
        const adminsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminsList);
      } catch (err) {
        setError("Failed to fetch admins");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      // Add new admin to Firestore, keeping the super admin logged in
      await addDoc(collection(db, "admins"), {
        email,
        password, // Consider hashing this password for security
        name,
        admin: true,
        createdAt: new Date().toISOString(),
      });

      setAdmins((prev) => [
        ...prev,
        { id: Date.now(), email, password, name, admin: true },
      ]);

      alert("Admin added successfully!");
      resetFormFields();
      setShowForm(false);
    } catch (err) {
      setAddAdminError("Failed to add admin: " + err.message);
    }
  };

  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setAddAdminError(null);
  };

  return (
    <div className="flex">
      <div className="functions">
        <div className="searchBar">
          <input type="text" placeholder="Search admins..." />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="addBtn">
          <MdAdd />
        </button>
      </div>

      <div className="table">
        <h1>Admins</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : admins.length === 0 ? (
          <p>No admins available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.name || "Super Admin"}</td>
                  <td>{admin.email}</td>
                  <td>{admin.password}</td>
                  <td>
                    <button className="editBtn">Promote</button>
                    <button className="deleteBtn">Demote</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="addAdminPopUp">
            <h3>Add Admin</h3>
            <button className="closeBtn" onClick={() => setShowForm(false)}>
              ✖
            </button>
            <form onSubmit={handleAddAdmin} className="add-admin-form">
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button type="submit">Add Admin</button>
            </form>
            {addAdminError && (
              <p className="error-message">{addAdminError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
