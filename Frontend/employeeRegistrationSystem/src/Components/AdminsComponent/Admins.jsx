import { collection, addDoc, getDoc, doc, getDocs, updateDoc } from "firebase/firestore"; 
import { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebase'; // Make sure Firebase is initialized properly
import './Admins.css'; // Import custom styles

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [addAdminError, setAddAdminError] = useState(null);

  // Fetch the list of admins from Firestore
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'admins'));
        const adminsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminsList);
      } catch (err) {
        setError('Failed to fetch admins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Handle adding a new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      // Create a new admin user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store admin details in Firestore
      await addDoc(collection(db, 'admins'), {
        uid: user.uid,
        email,
        password,
        name,
        admin: true,
      });

      // Update the list of admins
      setAdmins((prevAdmins) => [
        ...prevAdmins,
        { id: user.uid, password, email, name, admin: true },
      ]);

      alert('Admin added successfully!');
      resetFormFields();
    } catch (err) {
      setAddAdminError('Failed to add admin: ' + err.message);
    }
  };

  // Handle promoting an admin
  const handlePromote = async (adminId) => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, { admin: true }); // Assuming 'admin' field represents admin rights
      setAdmins((prevAdmins) => 
        prevAdmins.map((admin) => 
          admin.id === adminId ? { ...admin, admin: true } : admin
        )
      );
      alert('Admin promoted successfully!');
    } catch (err) {
      console.error('Error promoting admin:', err);
    }
  };

  // Handle demoting an admin
  const handleDemote = async (adminId) => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, { admin: false }); // Assuming 'admin' field represents admin rights
      setAdmins((prevAdmins) => 
        prevAdmins.map((admin) => 
          admin.id === adminId ? { ...admin, admin: false } : admin
        )
      );
      alert('Admin demoted successfully!');
    } catch (err) {
      console.error('Error demoting admin:', err);
    }
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setAddAdminError(null);
  };

  return (
    <div className="admins-container">
      <h1>Admins List</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">Error: {error}</p>
      ) : admins.length === 0 ? (
        <p>No admins available</p>
      ) : (
        <table className="admins-table">
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
                <td>{admin.name || 'Super Admin'}</td>
                <td>{admin.email}</td>
                <td>{admin.password}</td>
                <td>
                  {admin.name &&(
                    <>
                      <button onClick={() => handlePromote(admin.id)} className="action-button">Promote</button>
                      <button onClick={() => handleDemote(admin.id)} className="action-button">Demote</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Add Admin</h2>
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
      {addAdminError && <p className="error-message">{addAdminError}</p>}
    </div>
  );
};

export default Admins;
