require('dotenv').config();

const crypto = require('crypto');
const axios = require('axios');

const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || 'healthy-america-assessment.myshopify.com';
const targetUrl = process.env.LOCAL_WEBHOOK_URL || 'http://127.0.0.1:3000/webhooks/orders-paid';

if (!webhookSecret) {
  console.error('Missing SHOPIFY_WEBHOOK_SECRET in .env');
  process.exit(1);
}

const order = {
  id: 123456789,
  name: '#1001',
  email: 'cliente@example.com',
  currency: 'COP',
  total_price: '180000.00',
  financial_status: 'paid',
  processed_at: '2026-05-09T18:00:00Z',
  customer: {
    first_name: 'Juan',
    last_name: 'Borrero',
    email: 'cliente@example.com',
  },
  shipping_address: {
    city: 'Cali',
    first_name: 'Juan',
    last_name: 'Borrero',
  },
  line_items: [
    {
      title: 'Proteina Healthy',
      quantity: 1,
      sku: 'PROT-001',
      price: '120000.00',
      product_id: 111,
      variant_id: 222,
    },
    {
      title: 'Creatina Healthy',
      quantity: 1,
      sku: 'CREA-001',
      price: '60000.00',
      product_id: 333,
      variant_id: 444,
    },
  ],
};

async function main() {
  const body = JSON.stringify(order);
  const hmac = crypto.createHmac('sha256', webhookSecret).update(body).digest('base64');

  const response = await axios.post(targetUrl, body, {
    timeout: 10000,
    proxy: false,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Hmac-Sha256': hmac,
      'X-Shopify-Topic': 'orders/paid',
      'X-Shopify-Shop-Domain': shopDomain,
    },
    transformRequest: [(data) => data],
  });

  console.log('Webhook test response:', response.data);
}

main().catch((error) => {
  console.error('Webhook test failed:', {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    cause: error.cause?.message,
  });
  process.exit(1);
});
