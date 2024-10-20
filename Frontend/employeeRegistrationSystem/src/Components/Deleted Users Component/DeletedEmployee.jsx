import { useState, useEffect } from 'react';
import DeletedModal from './DeletedModal'; // Ensure this path is correct
import './DeletedEmployee.css';
import Loader from '../Loader/Loader';
import { auth } from '../../firebase';

const DeletedUser = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const DEFAULT_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';

  // Fetch deleted users from the backend
  const fetchData = async () => {
    let token = localStorage.getItem('token'); 
    setIsLoading(true);

    try {

        const user = auth.currentUser; // Get the current user
        if (user) {
            token = await user.getIdToken(); // Fetch the token
        } else {
            throw new Error('User not authenticated. Please log in.'); // Handle case where user is not authenticated
        }
      const response = await fetch('http://localhost:8080/deletedEmployees', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Use the token if available
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setDeletedUsers(data);
      setFilteredData(data); // Initialize filtered data
    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term (search by ID)
  useEffect(() => {
    if (searchTerm) {
      const filtered = deletedUsers.filter(user =>
        user.idNumber && user.idNumber.toString().includes(searchTerm)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(deletedUsers);
    }
  }, [searchTerm, deletedUsers]);

  // Handle search input changes, ensure only valid numbers are entered
  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (!isNaN(value)) {
      setSearchTerm(value);
    }
  };

  // Handle when a row is clicked to open the modal
  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="DeletedUser">
      <div className="searchBar bar2">
        <input 
          type="text" 
          placeholder="Search by ID" 
          value={searchTerm} 
          onChange={handleSearchChange} 
        />
      </div>

      <div className="table">
        <h1>Removed Employees</h1>
        {error && <p className="error-message">{error}</p>}

        {isLoading ? (
          <Loader />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Age</th>
                <th>Role</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((user) => (
                  <tr key={user.idNumber} onClick={() => handleRowClick(user)}>
                    <td>
                      <img
                        src={user.imageUrl || DEFAULT_IMAGE_URL}
                        alt="User"
                        width={50}
                        height={50}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.age}</td>
                    <td>{user.role}</td>
                    <td>{user.idNumber}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Render DeletedModal if a user is selected */}
      {selectedUser && <DeletedModal user={selectedUser} onClose={closeModal} />}
    </div>
  );
};

export default DeletedUser;
