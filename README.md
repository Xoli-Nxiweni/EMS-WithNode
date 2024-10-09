
---

# Employee Management System with Firebase and Express

This is a full-stack web application built with **Express.js** on the backend and **Firebase** for authentication, Firestore database, and storage. The system allows for the management of employee data, including adding, updating, deleting, and viewing employee information. Employee photos are uploaded to Firebase Storage, and data is stored in Firestore.

---

## Features

- **Add Employee**: Add new employee details, including name, surname, age, ID number, role, and an optional profile photo.
- **Update Employee**: Update existing employee details, including their profile photo.
- **Delete Employee**: Move employee details to a `deletedEmployees` collection, allowing soft deletion of employee data.
- **View Employees**: Fetch and display all employees, including filtering by ID number.
- **View Deleted Employees**: Fetch all previously deleted employees.
- **Authentication**: Firebase authentication to protect routes (can be enabled for admin-specific operations).
- **Role-based Authorization**: Restrict access to certain routes based on user roles (admin).

---

## Technologies Used

- **Node.js** with **Express.js**
- **Firebase Admin SDK**
  - Firestore for database storage
  - Firebase Storage for handling employee photo uploads
  - Firebase Authentication for securing routes
- **Multer** for handling file uploads
- **UUID** for generating unique photo identifiers
- **CORS** and **Body-Parser** middleware for API functionality

---

## Prerequisites


Make sure you have the following installed on your machine:

- **Node.js** (v14 or higher)
- **Firebase Admin SDK Service Account JSON** file
- **Firebase Project** setup with Firestore and Storage enabled
- **Multer** for file upload handling

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Xoli-Nxiweni/EmployeeRegistrationSystem-WithNode.git
   cd employee-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Place your `serviceAccount.json` file (Firebase Admin SDK credentials) in the root directory.
   - Update the `admin.initializeApp` call in `index.js` with your Firebase project credentials.

4. **Run the app**:
   ```bash
   npm start
   ```

5. **Access the API**:
   The server will be running on `http://localhost:3000`.

<!-- --- -->

##Credentials
- username: admin@admin.com
- password: admin123 

## API Endpoints

### 1. **Add Employee**
   - **Method**: `POST`
   - **Endpoint**: `/employees`
   - **Request Body**:
     ```json
     {
       "name": "John",
       "surname": "Doe",
       "age": 30,
       "idNumber": "1234567890",
       "role": "Developer"
     }
     ```
   - **Photo**: `multipart/form-data` (optional)

### 2. **View All Employees**
   - **Method**: `GET`
   - **Endpoint**: `/employees`

### 3. **View Employee by ID Number**
   - **Method**: `GET`
   - **Endpoint**: `/employees/:idNumber`

### 4. **Update Employee**
   - **Method**: `PUT`
   - **Endpoint**: `/employees/:idNumber`
   - **Request Body**:
     ```json
     {
       "name": "John",
       "surname": "Doe",
       "age": 31,
       "idNumber": "1234567890",
       "role": "Senior Developer"
     }
     ```
   - **Photo**: `multipart/form-data` (optional)

### 5. **Delete Employee**
   - **Method**: `DELETE`
   - **Endpoint**: `/employees/:idNumber`
   - This moves the employee data to a `deletedEmployees` collection for soft deletion.

### 6. **View Deleted Employees**
   - **Method**: `GET`
   - **Endpoint**: `/deletedEmployees`

---

## Middleware

- **Authentication**: (Can be uncommented for secure routes)
  - Token-based Firebase authentication using `verifyIdToken`.
- **Role Authorization**: Restricts certain routes to users with the `admin` role.

---

## Handling Photos

Photos are uploaded using `Multer` and stored in Firebase Storage. Each photo is assigned a unique name using `UUID`, and the generated link is stored in Firestore as part of the employee’s data.

---

## Future Enhancements

- Enable Firebase authentication to protect routes based on user roles (admin).
- Add pagination for viewing employees.
- Implement more detailed search/filtering options.

---

## License

This project is licensed under the MIT License.

---

## Author

For any inquiries, feel free to reach out:

**Author**: Xoli Nxiweni  
**Email**: xolinxiweni@gmail.com  
**GitHub**: [https://github.com/Xoli-Nxiweni/EmployeeRegistrationSystem-WithNode](https://github.com/Xoli-Nxiweni/EmployeeRegistrationSystem-WithNode)

---

Feel free to customize this `README.md` file to reflect any changes you make to the project or if you add additional features.

---

