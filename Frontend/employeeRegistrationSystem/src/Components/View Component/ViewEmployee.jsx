import { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import EditUser from './EditEmployee';
import UserModal from './EmployeeModal';
import PopupAlert from '../Alerts/PopUpAlert';
import Loader from '../Loader/Loader';
import { auth } from '../../firebase';
import './ViewEmployee.css';

// eslint-disable-next-line react/prop-types
const ViewUser = ({ onAddUserClick }) => {
    const [userData, setUserData] = useState([]); // Employee data
    const [filteredData, setFilteredData] = useState([]); // Filtered data for search
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const [editUser, setEditUser] = useState(null); // User being edited
    const [selectedUser, setSelectedUser] = useState(null); // User modal state
    const [showPopup, setShowPopup] = useState(false); // Popup alert for delete confirmation
    const [error, setError] = useState(null); // Error handling state
    const [isLoading, setIsLoading] = useState(false); // Loading state

    // Fetch employee data from backend
    const fetchData = async () => {
        setIsLoading(true);
        let token = '';
    
        try {
            const user = auth.currentUser; // Get the current user
            if (user) {
                token = await user.getIdToken(true); // Fetches a fresh token

            } else {
                throw new Error('User not authenticated. Please log in.');
            }
    
            const response = await fetch('http://localhost:8080/employees', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add token to Authorization header
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                const errorResponse = await response.json();
                if (response.status === 401) {
                    throw new Error('Unauthorized access. Please log in.');
                }
                throw new Error(`Error fetching data. Status: ${response.status}, Message: ${errorResponse.message || 'Unknown error'}`);
            }
    
            const data = await response.json();
    
            // Initialize Firebase storage
            const storage = getStorage();
    
            // Retrieve download URLs for images
            const updatedData = await Promise.all(data.map(async (user) => {
                const imageUrl = user.photoUrl 
                    ? await getDownloadURL(ref(storage, user.photoUrl)) 
                    : 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';
                return { ...user, photoUrl: imageUrl };
            }));
    
            setUserData(updatedData);
            setFilteredData(updatedData);
        } catch (err) {
            console.error('Error fetching data from the backend:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };
    

    // Fetch data on component mount
    useEffect(() => {
        fetchData();

        const handleStorageChange = () => {
            fetchData();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Handle search input change
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value) {
            const filtered = userData.filter(user =>
                user.idNumber.toString().includes(value)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(userData);
        }
    };

    // Handle user deletion
    const handleDelete = async (user) => {
        let token = '';

        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                token = await currentUser.getIdToken();
            } else {
                throw new Error('User not authenticated. Please log in.');
            }

            const response = await fetch(`http://localhost:8080/employees/${user.idNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error deleting employee');
            }

            const updatedData = userData.filter((item) => item.idNumber !== user.idNumber);
            setUserData(updatedData);
            setFilteredData(updatedData);

            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 3000);
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError(error);
        }
    };

    // Handle editing a user
    const handleEdit = (user) => {
        setEditUser(user);
    };

    // Save updated user data
    const handleSave = (updatedUser) => {
        const updatedData = userData.map(user =>
            user.idNumber === updatedUser.idNumber ? updatedUser : user
        );
        setUserData(updatedData);
        setFilteredData(updatedData);
        setEditUser(null);
    };

    // Cancel editing
    const handleCancel = () => {
        setEditUser(null);
    };

    // Show user details modal
    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    // Close user details modal
    const closeModal = () => {
        setSelectedUser(null);
    };

    return (
        <div className="flex">
            <div className="functions">
                <div className="searchBar">
                    <input
                        type="text"
                        placeholder="Search by ID"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="Add">
                    <button className="addBtn" onClick={onAddUserClick}>
                        <MdAdd />
                    </button>
                </div>
            </div>
            <div className="table">
                <h1>Active Employees</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Age</th>
                            <th>Role</th>
                            <th>ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? <Loader /> : filteredData.map((user) => (
                            <tr key={user.idNumber} onClick={() => handleRowClick(user)}>
                                <td>
                                    <img
                                        src={user.photoUrl}
                                        alt="User"
                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                    />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.age}</td>
                                <td>{user.role}</td>
                                <td>{user.idNumber}</td>
                                <td>
                                    <button className="editBtn" onClick={(e) => { e.stopPropagation(); handleEdit(user); }}>Edit</button>
                                    <button className="deleteBtn" onClick={(e) => { e.stopPropagation(); handleDelete(user); }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editUser && <EditUser user={editUser} onSave={handleSave} onCancel={handleCancel} />}
            {selectedUser && <UserModal user={selectedUser} onClose={closeModal} />}
            {showPopup && <PopupAlert message="Employee has been deleted" onClose={() => setShowPopup(false)} />}
            {error && <p>Error: {error.message}</p>}
        </div>
    );
};

export default ViewUser;
