// deletedEmployees.js
const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

const app = express()

// Firebase Admin Initialization
const serviceAccount = require("./employee-management-syst-b975e-firebase-adminsdk-xiafj-35d38c240e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'employee-management-syst-b975e.appspot.com',
});

const db = admin.firestore(); // Firestore reference

// Middleware to check authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check admin role
const checkAdminRole = (req, res, next) => {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Forbidden - Admins only' });
  }
  next();
};

// Get All Deleted Employees (admin-only)
router.get('/deletedEmployees', authenticate, checkAdminRole, async (req, res) => {
  try {
    const deletedEmployeesSnapshot = await db.collection('deletedEmployees').get();
    const deletedEmployees = deletedEmployeesSnapshot.docs.map(doc => doc.data());
    res.status(200).json(deletedEmployees);
  } catch (error) {
    console.error('Error fetching deleted employees:', error);
    res.status(500).json({ error: 'Error fetching deleted employees' });
  }
});

// Get Deleted Employee by idNumber (admin-only)
router.get('/deletedEmployees/:idNumber', authenticate, checkAdminRole, async (req, res) => {
  const idNumber = req.params.idNumber;

  try {
    const deletedEmployeeSnapshot = await db.collection('deletedEmployees').where('idNumber', '==', idNumber).get();
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

// Restore Deleted Employee by idNumber (admin-only)
router.post('/deletedEmployees/restore/:idNumber', authenticate, checkAdminRole, async (req, res) => {
  const idNumber = req.params.idNumber;

  try {
    const deletedEmployeeSnapshot = await db.collection('deletedEmployees').where('idNumber', '==', idNumber).get();
    if (deletedEmployeeSnapshot.empty) {
      return res.status(404).json({ error: 'Deleted employee not found' });
    }

    const employeeData = deletedEmployeeSnapshot.docs[0].data();
    await db.collection('employees').add(employeeData); // Restore to employees collection
    await deletedEmployeeSnapshot.docs[0].ref.delete(); // Remove from deletedEmployees collection

    res.status(200).json({ message: 'Employee restored successfully' });
  } catch (error) {
    console.error('Error restoring deleted employee:', error);
    res.status(500).json({ error: 'Error restoring deleted employee' });
  }
});

module.exports = router;


app.listen(3003, () => {
    console.log(`Deleted Employees service running on http://localhost:3003`);
  });