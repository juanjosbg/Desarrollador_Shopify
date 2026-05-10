const crypto = require('crypto');

function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) {
    return false;
  }

  const calculatedHmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

  const calculatedBuffer = Buffer.from(calculatedHmac, 'base64');
  const receivedBuffer = Buffer.from(hmacHeader, 'base64');

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
}

module.exports = {
  verifyShopifyHmac,
};
