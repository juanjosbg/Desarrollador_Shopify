require('dotenv').config();

const express = require('express');
const { getCustomerPurchaseContext, verifyShopifyHmac } = require('./shopify');
const { transformOrderPayload } = require('./transformer');
const { sendWithRetry } = require('./emailMarketingClient');

const app = express();

const PORT = process.env.PORT || 3000;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const EMAIL_MARKETING_ENDPOINT = process.env.EMAIL_MARKETING_ENDPOINT;

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/webhooks/orders-paid', express.raw({ type: 'application/json' }), async (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const topic = req.get('X-Shopify-Topic');
  const shop = req.get('X-Shopify-Shop-Domain');

  const isValid = verifyShopifyHmac(req.body, hmacHeader, SHOPIFY_WEBHOOK_SECRET);

  if (!isValid) {
    console.warn('Invalid Shopify webhook HMAC', { topic, shop });
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  let order;

  try {
    order = JSON.parse(req.body.toString('utf8'));
  } catch (error) {
    console.error('Invalid JSON payload', error);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  let purchaseContext = { isFirstOrder: null };

  try {
    purchaseContext = await getCustomerPurchaseContext(order.email || order.customer?.email);
  } catch (error) {
    console.error('Could not enrich order with Shopify Admin API', {
      message: error.message,
      orderId: order.id,
    });
  }

  const marketingPayload = transformOrderPayload(order, purchaseContext);

  console.log('Received paid order webhook', {
    topic,
    shop,
    orderId: order.id,
    orderName: order.name,
    email: marketingPayload.customer.email,
  });

  const result = await sendWithRetry(EMAIL_MARKETING_ENDPOINT, marketingPayload);

  if (!result.ok) {
    console.error('Failed to forward order to email endpoint', result);
    return res.status(502).json({ error: 'Failed to forward payload' });
  }

  return res.status(200).json({
    ok: true,
    forwarded: true,
    attempt: result.attempt,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Webhook service listening on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in .env.`);
    process.exit(1);
  }

  throw error;
});
