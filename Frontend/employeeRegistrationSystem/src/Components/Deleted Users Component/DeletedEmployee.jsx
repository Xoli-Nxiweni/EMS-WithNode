import { useState, useEffect } from 'react';
import DeletedModal from './DeletedModal'; // Ensure this path is correct
import './DeletedEmployee.css';
import Loader from '../Loader/Loader';

const DeletedUser = () => {
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/deletedEmployees');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setDeletedUsers(data);
            setFilteredData(data); 
        } catch (err) {
            console.error('Error fetching data from the backend:', err);
            setError(err);
        } finally{
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleSearchChange = (event) => {
        const value = event.target.value;
        if (!isNaN(value)) {
            setSearchTerm(value);
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(user); 
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    return (
        <div className="DeletedUser">
            <div className='searchBar bar2'>
                <input 
                    type="text" 
                    placeholder="Search by ID" 
                    value={searchTerm} 
                    onChange={handleSearchChange} 
                />
            </div>
            <div className="table">
                <h1>Removed Employees</h1>
                {error && <p>Error fetching data: {error.message}</p>}
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
                        {isLoading ? <Loader /> :
                        filteredData.map((user) => (
                            <tr key={user.idNumber} onClick={() => handleRowClick(user)}>
                                <td>
                                    <img 
                                        src={user.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'} 
                                        alt="User" 
                                    />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.age}</td>
                                <td>{user.role}</td>
                                <td>{user.idNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedUser && <DeletedModal user={selectedUser} onClose={closeModal} />}
        </div>
    );
};

export default DeletedUser;
