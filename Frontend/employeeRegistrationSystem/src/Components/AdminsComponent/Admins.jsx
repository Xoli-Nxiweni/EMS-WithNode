import { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Make sure Firebase is initialized properly

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');
  const [addAdminError, setAddAdminError] = useState(null);

  // Fetch the list of admins from Firestore
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null); // Reset error before new request
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
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
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email,
        name,
        role, // 'admin' or 'sysadmin'
      });

      // Update the list of admins
      setAdmins((prevAdmins) => [
        ...prevAdmins,
        { id: user.uid, email, name, role },
      ]);

      alert('Admin added successfully!');
      // Reset form fields
      setEmail('');
      setPassword('');
      setName('');
      setRole('admin');
      setAddAdminError(null);

    } catch (err) {
      setAddAdminError('Failed to add admin: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Admins List</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : admins.length === 0 ? (
        <p>No admins available</p>
      ) : (
        <ul>
          {admins.map((admin) => (
            <li key={admin.id}>
              {admin.name} ({admin.role})
            </li>
          ))}
        </ul>
      )}

      <h2>Add Admin</h2>
      <form onSubmit={handleAddAdmin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="sysadmin">System Admin</option>
        </select>
        <button type="submit">Add Admin</button>
      </form>
      {addAdminError && <p style={{ color: 'red' }}>{addAdminError}</p>}
    </div>
  );
};

export default Admins;
