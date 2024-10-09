import './AddEmployee.css';
import { useState, useEffect } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

const generateRandomID = () => {
    return Math.floor(Math.random() * 10000000000);
};

// eslint-disable-next-line react/prop-types
const AddUser = ({ onBack }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null); // Store the selected file
    const [formData, setFormData] = useState({
        name: '',
        idNumber: '',
        role: '',
        surname: '',
        age: '',
        photoUrl: ''
    });

    const [isLoading, setIsLoading] = useState(false);
 

    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState({});

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile); // Save the file to be used in the upload process

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 500;
                    const scaleSize = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scaleSize;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
                    setImagePreview(resizedImage);
                };
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });
    };

    const validateForm = () => {
        const formErrors = {};
        if (!formData.name) formErrors.name = 'Name is required***';
        if (!formData.surname) formErrors.surname = 'Surname is required***';
        if (!formData.age) {
            formErrors.age = 'Age is required***';
        } else if (isNaN(formData.age) || formData.age.length !== 2) {
            formErrors.age = 'Age must be 2 digits***';
        }
        if (!formData.role) formErrors.role = 'Role is required***';
        return formErrors;
    };

    const handleImageUpload = () =>{
        const storageRef = ref(storage, `images/${formData.idNumber}.jpg`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                setIsLoading(true);
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Error uploading file:', error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
                    setIsLoading(false)

                        setFormData((prev)=>({...prev, photoUrl : downloadURL}))                    

                    // setShowPopup(true);
                    // setErrors({}); // Reset errors on successful submission
                    // setFormData({
                    //     name: '',
                    //     surname: '',
                    //     age: '',
                    //     idNumber: '',
                    //     role: '',
                    //     photoUrl: ''
                    // });
                    setImagePreview(null);
                } catch (error) {
                    console.error('Error adding user:', error.response ? error.response.data : error);
                    setErrors({ submission: 'Failed to add user. Please try again.' });
                }
            }
        );
    }

    useEffect(()=>{
        // setIsLoading(true)
        handleImageUpload()
    },[file])

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        if (file) {

            // const newUserData = {
            //             ...formData,
            //             photoUrl: downloadURL,
            //         };

                    // setIsLoading(true)
                    const response = await axios.post('http://localhost:8080/employees', formData);
                    console.log('Response:', response.data);
                    setIsLoading(false)
                    setShowPopup(true);

        } else {
            setErrors({ image: 'Image is required***' });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                setShowPopup(false);
                onBack();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showPopup, onBack]);

    useEffect(() => {
        const randomID = generateRandomID();
        setFormData((prevFormData) => ({ ...prevFormData, idNumber: randomID.toString() }));
    }, []);

    return (
        <div className="AddUserContainer">
            {showPopup && (
                <div className="popup">
                    <div className="popup-inner">User has been added!</div>
                </div>
            )}
            <div className="myForm">
                <form onSubmit={handleSubmit}>
                    <div className="inputContainer">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    {errors.name && <p className="error">{errors.name}</p>}
                    <div className="inputContainer">
                        <label htmlFor="surname">Surname</label>
                        <input type="text" id="surname" value={formData.surname} onChange={handleInputChange} />
                    </div>
                    {errors.surname && <p className="error">{errors.surname}</p>}
                    <div className="inputContainer">
                        <label htmlFor="age">Age</label>
                        <input type="tel" id="age" value={formData.age} onChange={handleInputChange} />
                    </div>
                    {errors.age && <p className="error">{errors.age}</p>}
                    <div className="inputContainer">
                        <label htmlFor="idNumber">ID</label>
                        <input type="text" id="idNumber" value={formData.idNumber} disabled />
                    </div>
                    <div className="inputContainer">
                        <label htmlFor="role">Role</label>
                        <input type="text" id="role" value={formData.role} onChange={handleInputChange} />
                    </div>
                    {errors.role && <p className="error">{errors.role}</p>}
                    <div className="previous">
                        <div className="imagePreview">{imagePreview && <img src={imagePreview} alt="Preview" />}</div>
                        <label htmlFor="image" className="uploadLabel">Upload Image</label>
                        <input type="file" id="image" onChange={handleImageChange} required />
                    </div>
                    <div className="addingBtn">
                        <button type="submit">{ isLoading? 'Wait...' : 'ADD +'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;
