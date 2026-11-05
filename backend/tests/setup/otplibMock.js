// Mock for otplib in Jest to avoid ESM @scure/base parsing issues
module.exports = {
  authenticator: {
    generateSecret: () => 'JBSWY3DPEHPK3PXP',
    keyuri: (email, issuer, secret) => `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`,
    generate: (secret) => '123456',
    check: (token, secret) => token === '123456' || token === '000000',
    verify: ({ token, secret }) => token === '123456' || token === '000000'
  }
};
