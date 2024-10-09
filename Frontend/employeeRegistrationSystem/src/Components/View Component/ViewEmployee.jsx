import { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import EditUser from './EditEmployee';
import UserModal from './EmployeeModal';
import PopupAlert from '../Alerts/PopUpAlert';
import './ViewEmployee.css';
import Loader from '../Loader/Loader'

// eslint-disable-next-line react/prop-types
const ViewUser = ({ onAddUserClick }) => {
    const [userData, setUserData] = useState([]); // State to hold all employee data
    const [filteredData, setFilteredData] = useState([]); // State to hold filtered data based on search
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [editUser, setEditUser] = useState(null); // State to hold the user being edited
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user details modal
    const [showPopup, setShowPopup] = useState(false); // State for delete confirmation popup
    const [error, setError] = useState(null); // State for error handling
    const [isLoading, setIsLoading] = useState(false)

    // Fetch employee data from the backend
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
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
        } finally{
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();

        // Set up event listener for localStorage changes (if needed)
        const handleStorageChange = () => {
            fetchData();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Update filtered data based on the search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = userData.filter(user =>
                user.idNumber.toString().includes(searchTerm)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(userData);
        }
    }, [searchTerm, userData]);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
    };

    const handleDelete = async (user) => {
        try {
            const response = await fetch(`http://localhost:8080/employees/${user.idNumber}`, {
                method: 'DELETE',
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
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
    };

    const handleSave = (updatedUser) => {
        const updatedData = userData.map(user =>
            user.idNumber === updatedUser.idNumber ? updatedUser : user
        );
        setUserData(updatedData);
        setFilteredData(updatedData); // Ensure filtered data is also updated
        setEditUser(null);
    };

    const handleCancel = () => {
        setEditUser(null);
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    return (
        <div className='flex'>
            <div className='functions'>
                <div className='searchBar'>
                    <input 
                        type="text" 
                        placeholder="Search by ID" 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                    />
                </div>
                <div className='Add'>
                    <button className='addBtn' onClick={onAddUserClick}><MdAdd /></button>
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
                        { isLoading ? <Loader/> : filteredData.map((user) => (
                            <tr key={user.idNumber} onClick={() => handleRowClick(user)}>
                                <td>
                                    <img 
                                        src={user.photoUrl || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'} 
                                        alt="User" 
                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }} // Optional styling
                                    />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.age}</td>
                                <td>{user.role}</td>
                                <td>{user.idNumber}</td>
                                <td>
                                    <button className='editBtn' onClick={(e) => { e.stopPropagation(); handleEdit(user); }}>edit</button>
                                    <button className='deleteBtn' onClick={(e) => { e.stopPropagation(); handleDelete(user); }}>delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editUser && <EditUser user={editUser} onSave={handleSave} onCancel={handleCancel} />}
            {selectedUser && <UserModal user={selectedUser} onClose={closeModal} />}
            {showPopup && <PopupAlert message="Employee has been deleted" onClose={() => setShowPopup(false)} />}
            {error && <p>Error: {error.message}</p>} {/* Display error if exists */}
        </div>
    );
};

export default ViewUser;
