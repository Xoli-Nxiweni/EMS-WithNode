const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

// Firebase Admin Initialization
const serviceAccount = require("./employee-management-syst-b975e-firebase-adminsdk-xiafj-35d38c240e.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'employee-management-syst-b975e.appspot.com',
});


const db = admin.firestore();
const bucket = admin.storage().bucket();

// Express App Setup
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json()); // Parse JSON request bodies

// Setup multer for handling photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Middleware to check authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check for admin role
const checkAdminRole = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Function to upload photo to Firebase Storage
const uploadPhoto = (file) => {
  return new Promise((resolve, reject) => {
    const photoId = uuidv4();
    const blob = bucket.file(`employee_photos/${photoId}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    blobStream.on('finish', () => {
      const photoUrl = `https://storage.googleapis.com/${bucket.name}/employee_photos/${photoId}_${file.originalname}`;
      resolve(photoUrl);
    });
    
    blobStream.on('error', (error) => {
      console.error('Blob stream error:', error);
      reject(new Error('Error uploading photo'));
    });
    
    blobStream.end(file.buffer);
  });
};

// Routes
// 1. Add Employee
app.post('/employees', /*authenticate */ /*checkAdminRole */ upload.single('photo'), async (req, res) => {
  try {
    const { name, surname, age, idNumber, role, photoUrl } = req.body;

    // Validate input data
    if (!name || !surname || !age || !idNumber || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // let photoUrl = null;
    // if (req.file) {
    //   photoUrl = await uploadPhoto(req.file);
    // }

    // Add employee to Firestore
    await db.collection('employees').add({
      name,
      surname,
      age,
      idNumber,
      role,
      photoUrl,
    });

    res.status(201).json({ message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Error adding employee' });
  }
});

// 2. View all employees
app.get('/employees', /*authenticate */ async (req, res) => {
  try {
    const employeesSnapshot = await db.collection('employees').get();
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ error: 'Error retrieving employees' });
  }
});

//view filtered employee
app.get('/employees/:idNumber', /*authenticate */ async (req, res) => {
  try {
    const idNumber = req.params.idNumber;
    console.log('Searching for employee with ID:', idNumber); // Add logging

    const employeesSnapshot = await db.collection('employees')
      .where('idNumber', '==', idNumber)
      .get();

    if (employeesSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))[0];

    console.log('Found employee:', employee); // Add logging
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error searching for employee:', error);
    res.status(500).json({ error: 'Error searching for employee' });
  }
});

// 3. Update an employee
// app.put('/employees/:id', upload.single('photo'), async (req, res) => {
//   try {
//     const employeeId = req.params.id;
//     console.log("Employee ID:", employeeId);

//     const { name, surname, age, idNumber, role } = req.body;
//     console.log("Request body:", req.body);

//     if (!name || !surname || !age || !idNumber || !role) {
//       console.log("Missing fields:", { name, surname, age, idNumber, role });
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     const updateData = { name, surname, age, idNumber, role };
//     console.log("Update data:", updateData);

//     // If there's a new photo, upload it and update the photoUrl
//     if (req.file) {
//       console.log("Photo file uploaded:", req.file);
//       const photoUrl = await uploadPhoto(req.file);
//       updateData.photoUrl = photoUrl;
//       console.log("Photo URL:", photoUrl);
//     }

//     const employeeDoc = db.collection('employees').doc(employeeId);
//     const docSnapshot = await employeeDoc.get();

//     if (!docSnapshot.exists) {
//       console.log("Employee not found for ID:", employeeId);
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     await employeeDoc.update(updateData);
//     console.log("Employee updated successfully:", updateData);

//     res.status(200).json({ message: 'Employee updated successfully' });
//   } catch (error) {
//     console.error('Error updating employee:', error);
//     res.status(500).json({ error: 'Error updating employee' });
//   }
// });


// 3. Update an employee by idNumber
app.put('/employees/:idNumber', upload.single('photo'), async (req, res) => { 
  try {
    const idNumber = req.params.idNumber;  // Use idNumber from the URL
    console.log('Received ID Number:', idNumber);  // Debugging log

    const { name, surname, age, role } = req.body;
    
    if (!name || !surname || !age || !idNumber || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updateData = { name, surname, age, idNumber, role };

    // If there's a new photo, upload it and update the photoUrl
    if (req.file) {
      const photoUrl = await uploadPhoto(req.file);
      updateData.photoUrl = photoUrl;
    }

    // Find the employee by idNumber
    const employeeSnapshot = await db.collection('employees')
      .where('idNumber', '==', idNumber)
      .get();

    console.log('Employee Snapshot:', employeeSnapshot.size); // Debug log: Check if results were returned

    if (employeeSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get the document ID to update
    const employeeDoc = employeeSnapshot.docs[0].ref;

    // Update the employee data
    await employeeDoc.update(updateData);

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Error updating employee' });
  }
});



// 4. Delete an employee
// app.delete('/employees/:id', /*authenticate */ /*checkAdminRole */ async (req, res) => {
//   try {
//     const employeeId = req.params.id;

//     // Delete the employee document from Firestore
//     await db.collection('employees').doc(employeeId).delete();

//     res.status(200).json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting employee:', error);
//     res.status(500).json({ error: 'Error deleting employee' });
//   }
// });

// 4. Delete an employee by idNumber
// app.delete('/employees/:idNumber', async (req, res) => {
//   try {
//     const idNumber = req.params.idNumber;

//     // Find the employee by idNumber
//     const employeeSnapshot = await db.collection('employees')
//       .where('idNumber', '==', idNumber)
//       .get();

//     if (employeeSnapshot.empty) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     // Get the document ID to delete
//     const employeeDoc = employeeSnapshot.docs[0].ref;

//     // Delete the employee document from Firestore
//     await employeeDoc.delete();

//     res.status(200).json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting employee:', error);
//     res.status(500).json({ error: 'Error deleting employee' });
//   }
// });

app.delete('/employees/:idNumber', async (req, res) => {
  try {
    const idNumber = req.params.idNumber;

    // Find the employee by idNumber in the 'employees' collection
    const employeeSnapshot = await db.collection('employees')
      .where('idNumber', '==', idNumber)
      .get();

    if (employeeSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get the employee document reference and data
    const employeeDoc = employeeSnapshot.docs[0].ref;
    const employeeData = employeeSnapshot.docs[0].data();

    // Add the employee data to the 'deletedEmployees' collection
    await db.collection('deletedEmployees').add(employeeData);

    // Delete the employee document from the 'employees' collection
    await employeeDoc.delete();

    res.status(200).json({ message: 'Employee deleted and moved to deletedEmployees successfully.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Error deleting employee' });
  }
});

// Fetch all deleted employees
app.get('/deletedEmployees', async (req, res) => {
  try {
    const deletedEmployeesSnapshot = await db.collection('deletedEmployees').get();
    const deletedEmployees = deletedEmployeesSnapshot.docs.map(doc => doc.data());

    res.status(200).json(deletedEmployees);
  } catch (error) {
    console.error('Error fetching deleted employees:', error);
    res.status(500).json({ error: 'Error fetching deleted employees' });
  }
});

// Fetch a specific deleted employee by idNumber
app.get('/deletedEmployees/:idNumber', async (req, res) => {
  try {
    const idNumber = req.params.idNumber;

    const deletedEmployeeSnapshot = await db.collection('deletedEmployees')
      .where('idNumber', '==', idNumber)
      .get();

    if (deletedEmployeeSnapshot.empty) {
      return res.status(404).json({ error: 'Deleted employee not found' });
    }

    const deletedEmployee = deletedEmployeeSnapshot.docs[0].data();
    res.status(200).json(deletedEmployee);
  } catch (error) {
    console.error('Error fetching deleted employee:', error);
    res.status(500).json({ error: 'Error fetching deleted employee' });
  }
});


// 5. Search for an employee by ID number
app.get('/employees/:idNumber', /*authenticate */ async (req, res) => {
  try {
    const idNumber = req.params.idNumber;

    const employeesSnapshot = await db.collection('employees')
      .where('idNumber', '==', idNumber)
      .get();

    if (employeesSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))[0];

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error searching for employee:', error);
    res.status(500).json({ error: 'Error searching for employee' });
  }
});

// Error handling middleware
app.use((err, req, res, nexact) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
