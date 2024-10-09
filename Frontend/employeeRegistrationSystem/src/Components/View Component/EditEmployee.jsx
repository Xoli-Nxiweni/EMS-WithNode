import { useState, useEffect } from 'react';
import axios from 'axios';
import './EditEmployee.css';

// eslint-disable-next-line react/prop-types
const EditUser = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState(user);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Update form data when user prop changes
    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset any previous errors
    
        try {
            // Ensure idNumber is sent as a string
            const response = await axios.put(`http://localhost:8080/employees/${String(formData.idNumber)}`, formData);
            onSave(response.data); // Pass the updated user data to the onSave callback
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Failed to update user. Please try again.'); // Set error message if request fails
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    
    
    

    return (
        <div className="editUserContainer">
            <div className="editUserModal">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error">{error}</p>} {/* Display error message */}
                    <div className='inputContainer2'>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name || ''} // Ensure value is not undefined
                            onChange={handleChange}
                            required // Make the input required
                        />
                    </div>
                    <div className='inputContainer2'>
                        <label htmlFor="surname">Surname</label>
                        <input
                            type="text"
                            id="surname"
                            value={formData.surname || ''} // Ensure value is not undefined
                            onChange={handleChange}
                            required // Make the input required
                        />
                    </div>
                    <div className='inputContainer2'>
                        <label htmlFor="age">Age</label>
                        <input
                            type="number"
                            id="age"
                            value={formData.age || ''} // Ensure value is not undefined
                            onChange={handleChange}
                            required // Make the input required
                        />
                    </div>
                    <div className='inputContainer2'>
                        <label htmlFor="idNumber">ID</label>
                        <input
                            type="text"
                            id="idNumber"
                            value={formData.idNumber || ''} // Ensure value is not undefined
                            onChange={handleChange}
                            disabled // ID should be non-editable
                        />
                    </div>
                    <div className='inputContainer2'>
                        <label htmlFor="role">Role</label>
                        <input
                            type="text"
                            id="role"
                            value={formData.role || ''} // Ensure value is not undefined
                            onChange={handleChange}
                            required // Make the input required
                        />
                    </div>
                    <div className="formActions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button> {/* Disable button while loading */}
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
