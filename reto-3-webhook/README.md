# Reto 3 - Shopify orders/paid webhook

Servicio Node.js que recibe el webhook `orders/paid` de Shopify, valida la firma HMAC, transforma el payload de la orden y lo reenvia a un endpoint mock de email marketing en Webhook.site.

## Flujo

1. Shopify envia `POST /webhooks/orders-paid`.
2. El servicio valida `X-Shopify-Hmac-Sha256` usando `SHOPIFY_WEBHOOK_SECRET` y el raw body.
3. Si la firma no es valida, responde `401`.
4. Si la firma es valida, transforma la orden a un payload reducido para marketing.
5. Envia el JSON transformado a `EMAIL_MARKETING_ENDPOINT`.
6. Si el endpoint externo falla, reintenta hasta 3 veces y deja logs.

## Variables de entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables:

```env
PORT=3000
SHOPIFY_WEBHOOK_SECRET=your_shopify_app_client_secret
EMAIL_MARKETING_ENDPOINT=https://webhook.site/your-endpoint
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_SHOP_DOMAIN=healthy-america-assessment.myshopify.com
```

`SHOPIFY_WEBHOOK_SECRET` debe ser el client secret de la app Shopify que emite el webhook.

Para probar localmente sin una app Shopify real, usar un secreto de prueba:

```env
SHOPIFY_WEBHOOK_SECRET=test_secret_123
EMAIL_MARKETING_ENDPOINT=https://webhook.site/tu-url-unica
```

`EMAIL_MARKETING_ENDPOINT` debe ser la URL unica generada por Webhook.site. No se deben subir valores reales en `.env`; ese archivo esta ignorado por Git.

Importante: `.env.example` es una plantilla y por eso no contiene credenciales reales. Para evaluar el proyecto no se necesita mi `.env`; se puede crear uno nuevo con `SHOPIFY_WEBHOOK_SECRET=test_secret_123` y una URL propia de Webhook.site.

## Instalacion

```bash
npm install
```

## Ejecutar localmente

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{"ok":true}
```

## Probar con payload firmado

Con el servidor corriendo:

```bash
npm run test:webhook
```

Este script genera una orden falsa, calcula el HMAC con `SHOPIFY_WEBHOOK_SECRET` y envia el request a:

```text
http://127.0.0.1:3000/webhooks/orders-paid
```

Respuesta esperada:

```json
{"ok":true,"forwarded":true,"attempt":1}
```

En Webhook.site debe aparecer el payload transformado.

Esta prueba cubre el flujo principal sin depender de una tienda real: simula el webhook de Shopify, firma el body con HMAC, valida la firma en el servidor, transforma la orden y la envia al endpoint mock.

## Probar con ngrok

```bash
ngrok http 3000
```

Configurar en Shopify la URL:

```text
https://TU-SUBDOMINIO.ngrok-free.app/webhooks/orders-paid
```

Topic:

```text
orders/paid
```

## Payload enviado a marketing

Ejemplo:

```json
{
  "customer": {
    "name": "Juan Borrero",
    "email": "cliente@example.com",
    "city": "Cali"
  },
  "order": {
    "id": 123456789,
    "name": "#1001",
    "total": "180000.00",
    "currency": "COP",
    "financialStatus": "paid",
    "processedAt": "2026-05-09T18:00:00Z"
  },
  "products": [
    {
      "title": "Proteina Healthy",
      "quantity": 1,
      "sku": "PROT-001",
      "price": "120000.00",
      "productId": 111,
      "variantId": 222
    }
  ],
  "isFirstOrder": null
}
```

## Nota sobre el bonus

El campo `isFirstOrder` queda preparado para enriquecerse con Admin API GraphQL usando `SHOPIFY_ADMIN_ACCESS_TOKEN`. En una implementacion productiva se consultaria el historial del cliente antes de enviar el payload a marketing.
