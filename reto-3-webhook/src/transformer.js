function transformOrderPayload(order, options = {}) {
  const customer = order.customer || {};
  const shippingAddress = order.shipping_address || {};
  const billingAddress = order.billing_address || {};

  const firstName = customer.first_name || shippingAddress.first_name || billingAddress.first_name || '';
  const lastName = customer.last_name || shippingAddress.last_name || billingAddress.last_name || '';
  const name = `${firstName} ${lastName}`.trim();

  return {
    customer: {
      name,
      email: order.email || customer.email || null,
      city: shippingAddress.city || billingAddress.city || null,
    },
    order: {
      id: order.id,
      name: order.name,
      total: order.total_price,
      currency: order.currency,
      financialStatus: order.financial_status,
      processedAt: order.processed_at,
    },
    products: (order.line_items || []).map((item) => ({
      title: item.title,
      quantity: item.quantity,
      sku: item.sku || null,
      price: item.price,
      productId: item.product_id,
      variantId: item.variant_id,
    })),
    isFirstOrder: options.isFirstOrder ?? null,
  };
}

module.exports = {
  transformOrderPayload,
};
