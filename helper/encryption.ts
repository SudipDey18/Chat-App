import {RSA} from 'react-native-rsa-native'

export async function generateKeyPair() {
  try {
    console.log('🔑 Generating RSA key pair...');
    
    const keys = await RSA.generateKeys(2048);
    
    console.log('✅ Keys generated successfully');
    return {
      publicKey: keys.public,
      privateKey: keys.private
    };
  } catch (error) {
    console.error('❌ Key generation failed:', error);
    throw error;
  }
}