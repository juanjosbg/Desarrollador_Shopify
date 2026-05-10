const axios = require('axios');

async function sendWithRetry(endpoint, payload, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 5000,
        proxy: false,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        ok: true,
        status: response.status,
        attempt,
      };
    } catch (error) {
      lastError = error;

      console.error(`Email endpoint failed. Attempt ${attempt}/${retries}`, {
        message: error.message,
        status: error.response?.status,
      });

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  return {
    ok: false,
    error: lastError.message,
  };
}

module.exports = {
  sendWithRetry,
};
