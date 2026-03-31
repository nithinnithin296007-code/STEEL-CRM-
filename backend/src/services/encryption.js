import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'steel-crm-secret-key-change-this-in-production';
const ALGORITHM = 'aes-256-cbc';

// Generate IV (Initialization Vector)
function generateIV() {
  return crypto.randomBytes(16);
}

// Encrypt data
export function encryptData(data) {
  try {
    if (!data) return null;
    
    const iv = generateIV();
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let encrypted = cipher.update(String(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data combined
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    return data;
  }
}

// Decrypt data
export function decryptData(encryptedData) {
  try {
    if (!encryptedData) return null;
    
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return encryptedData;
    
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return encryptedData;
  }
}

// Encrypt object
export function encryptObject(obj) {
  const encrypted = { ...obj };
  
  if (encrypted.phone) encrypted.phone = encryptData(encrypted.phone);
  if (encrypted.email) encrypted.email = encryptData(encrypted.email);
  if (encrypted.address) encrypted.address = encryptData(encrypted.address);
  
  return encrypted;
}

// Decrypt object
export function decryptObject(obj) {
  const decrypted = { ...obj };
  
  if (decrypted.phone) decrypted.phone = decryptData(decrypted.phone);
  if (decrypted.email) decrypted.email = decryptData(decrypted.email);
  if (decrypted.address) decrypted.address = decryptData(decrypted.address);
  
  return decrypted;
}