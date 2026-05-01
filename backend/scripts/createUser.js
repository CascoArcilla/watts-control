const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const usernameRegex = require('../consts/regexUsername.js');
const passwordRegex = require('../consts/regexPassword.js');
const { User, Group } = require('../models');

async function createUser(username, rawPassword, group) {
  const groups = ['Administrador', 'Lector', 'Propietario'];
  groupName = groups[parseInt(group)] || groups[1];

  try {
    // Comprobar formato con reges para username y password
    if (!usernameRegex.test(username)) {
      console.error('Error: Invalid username format.');
      process.exit(1);
    }

    if (!passwordRegex.test(rawPassword)) {
      console.error('Error: Invalid password format.');
      process.exit(1);
    }

    // 1. Find the role
    const group = await Group.findOne({ where: { name: groupName } });
    if (!group) {
      console.error(`Error: Role '${groupName}' does not exist in the database.`);
      process.exit(1);
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.error(`Error: User '${username}' already exists.`);
      process.exit(1);
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Create the user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      use_password: true,
    });

    // 5. Assign the role
    await newUser.addGroup(group);

    console.log(`User '${username}' created successfully with group '${groupName}'.`);
    process.exit(0);

  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

// Simple CLI arguments parsing
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log('Usage: node createUser.js <username> <password> <group>');
  console.log('');
  console.log('Valid groups:');
  console.log('0 - Administrador');
  console.log('1 - Lector');
  console.log('2 - Propietario');
  console.log('');
  console.log('Invalid arguments format.');
  process.exit(1);
}

const [username, password, group] = args;

createUser(username, password, group);
