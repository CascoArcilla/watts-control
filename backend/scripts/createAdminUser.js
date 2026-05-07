const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const usernameRegex = require('../consts/regexUsername.js');
const passwordRegex = require('../consts/regexPassword.js');
const { User, Group } = require('../models');

async function createAdminUser() {
    const username = process.env.EC_SYS_USERNAME;
    const password = process.env.EC_SYS_PASSWORD;

    try {
        if (!usernameRegex.test(username)) {
            throw new Error('Invalid username format.');
        }

        if (!passwordRegex.test(password)) {
            throw new Error('Invalid password format.');
        }

        const group = await Group.findOne({ where: { name: 'Administrador' } });
        if (!group) {
            throw new Error('Group "Administrador" not found.');
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('User "' + username + '" already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            use_password: true,
        });

        await newUser.addGroup(group);

        console.log('User "' + username + '" created successfully with group "Administrador".');
        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
}

createAdminUser();