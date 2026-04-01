const fs = require('fs');
const path = require('path');
const csvFile = path.join(__dirname, '../users.csv');

// Initialize CSV with headers if it doesn't exist
if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(csvFile, 'Username,PhoneNumber,CreatedAt\n');
}

const loginUser = (req, res) => {
  const { username, phoneNumber } = req.body;
  
  if (!username || !phoneNumber) {
    return res.status(400).json({ message: 'Username and Phone Number are required.' });
  }

  // Read the CSV data (Excel sheet)
  const data = fs.readFileSync(csvFile, 'utf8');
  const lines = data.split('\n').filter(line => line.trim() !== '');
  
  let userFound = false;
  let matchesPair = false;

  for (let i = 1; i < lines.length; i++) {
    const [storedUser, storedPhone] = lines[i].split(',');
    
    if (storedUser === username || storedPhone === phoneNumber) {
      userFound = true;
      if (storedUser === username && storedPhone === phoneNumber) {
        matchesPair = true;
      }
      break;
    }
  }

  if (userFound) {
    if (matchesPair) {
       return res.status(200).json({ message: 'Login successful', user: { username, phoneNumber } });
    } else {
       return res.status(401).json({ message: 'Invalid credentials. This Username or Phone number is already registered to a different account.' });
    }
  } else {
    // Generate new record and save logic
    const newUserLine = `${username},${phoneNumber},${new Date().toISOString()}\n`;
    fs.appendFileSync(csvFile, newUserLine);
    return res.status(201).json({ message: 'Registration successful', user: { username, phoneNumber } });
  }
};

module.exports = { loginUser };
