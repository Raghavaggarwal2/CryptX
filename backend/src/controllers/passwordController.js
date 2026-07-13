const prisma = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

const getPasswords = async (req, res) => {
  try {
    const passwords = await prisma.password.findMany({
      where: { userId: req.user.id }
    });
    
    // Decrypt the passwords before sending to frontend
    const decryptedPasswords = passwords.map(p => ({
      ...p,
      password: decrypt(p.password)
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    console.error("Error fetching passwords:", error);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
};

const createPassword = async (req, res) => {
  const { site, username, password } = req.body;
  try {
    // Encrypt the password before storing in DB
    const encryptedPassword = encrypt(password);

    const newPassword = await prisma.password.create({
      data: {
        site,
        username,
        password: encryptedPassword,
        userId: req.user.id
      },
    });

    // Send back the decrypted version for immediate UI update
    res.status(201).json({
      ...newPassword,
      password: decrypt(newPassword.password)
    });
  } catch (error) {
    console.error("Error creating password:", error);
    res.status(500).json({ error: "Failed to save password" });
  }
};

const deletePassword = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.password.delete({
      where: { id, userId: req.user.id },
    });
    res.json({ message: "Password deleted successfully" });
  } catch (error) {
    console.error("Error deleting password:", error);
    res.status(500).json({ error: "Failed to delete password" });
  }
};

module.exports = { getPasswords, createPassword, deletePassword };
