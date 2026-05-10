const crypto = require('crypto');
const axios = require('axios');

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

async function getCustomerPurchaseContext(email) {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION || '2026-04';

  if (!email || !shopDomain || !accessToken) {
    return { isFirstOrder: null };
  }

  const query = `
    query CustomerByEmail($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            numberOfOrders
          }
        }
      }
    }
  `;

  const response = await axios.post(
    `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`,
    {
      query,
      variables: {
        query: `email:${email}`,
      },
    },
    {
      timeout: 5000,
      proxy: false,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    },
  );

  if (response.data.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(response.data.errors)}`);
  }

  const customer = response.data.data?.customers?.edges?.[0]?.node;

  if (!customer || typeof customer.numberOfOrders !== 'number') {
    return { isFirstOrder: null };
  }

  return {
    isFirstOrder: customer.numberOfOrders <= 1,
    customerAdminId: customer.id,
  };
}

module.exports = {
  getCustomerPurchaseContext,
  verifyShopifyHmac,
};
