#!/usr/bin/env node

/**
 * SSL Certificate Generation Script
 * Generates self-signed SSL certificates for local HTTPS development
 * 
 * Usage: node scripts/generate-certs.js
 */

const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const CERTS_DIR = path.join(__dirname, '..', 'certs');
const KEY_PATH = path.join(CERTS_DIR, 'localhost.key');
const CERT_PATH = path.join(CERTS_DIR, 'localhost.crt');

console.log('🔐 Generating SSL certificates for local development...\n');

// Ensure certs directory exists
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
    console.log('✅ Created certs directory');
}

// Check if certificates already exist
if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
    console.log('⚠️  Certificates already exist:');
    console.log(`   - ${KEY_PATH}`);
    console.log(`   - ${CERT_PATH}`);
    console.log('\nTo regenerate, delete the existing files and run this script again.\n');
    process.exit(0);
}

try {
    // Generate a key pair
    console.log('🔑 Generating RSA key pair...');
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Create a certificate
    console.log('📄 Creating certificate...');
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    // Set certificate attributes
    const attrs = [
        { name: 'commonName', value: 'localhost' },
        { name: 'countryName', value: 'US' },
        { shortName: 'ST', value: 'State' },
        { name: 'localityName', value: 'City' },
        { name: 'organizationName', value: 'Artist Portfolio Dev' },
        { shortName: 'OU', value: 'Development' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Add extensions
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 2, value: '*.localhost' },
                { type: 7, ip: '127.0.0.1' },
                { type: 7, ip: '::1' }
            ]
        },
        {
            name: 'subjectKeyIdentifier'
        }
    ]);

    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convert to PEM format
    const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
    const pemCert = forge.pki.certificateToPem(cert);

    // Write to files
    console.log('💾 Writing certificate files...');
    fs.writeFileSync(KEY_PATH, pemKey);
    fs.writeFileSync(CERT_PATH, pemCert);

    console.log('\n✅ SSL certificates generated successfully!\n');
    console.log('📁 Certificate locations:');
    console.log(`   Private Key: ${KEY_PATH}`);
    console.log(`   Certificate: ${CERT_PATH}`);
    console.log('\n📌 Certificate details:');
    console.log(`   Common Name: localhost`);
    console.log(`   Valid From:  ${cert.validity.notBefore.toISOString()}`);
    console.log(`   Valid Until: ${cert.validity.notAfter.toISOString()}`);
    console.log('\n🚀 You can now run: npm run dev\n');
    console.log('⚠️  Note: Your browser will show a security warning because this is a self-signed certificate.');
    console.log('   This is normal for development. Click "Advanced" and "Proceed to localhost" to continue.\n');

} catch (error) {
    console.error('❌ Error generating certificates:', error.message);
    process.exit(1);
}
