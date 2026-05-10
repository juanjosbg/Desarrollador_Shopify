# Assessment Desarrollador Shopify - Healthy America

Este repositorio contiene la entrega de Assessment: Desarrollador Shopify

- by. Juanjosé B.

## Documentos del assessment
Los documentos escritos del Reto 1 y la justificación de decisiones del Reto 2 están disponibles aquí:

[Documento de auditoría y decisiones técnicas](https://docs.google.com/document/d/1HM0uT8QsoM2y8TQQB7ZBoKqUs6I_4JRUSnkHuIOd5dw/edit?usp=sharing)

## Reto 2 - Mejoras de conversión en Dawn

Para el Reto 2 escogí implementar:

1. Opción A - Barra de progreso de envío gratis
2. Opción C - Trust badges configurables

No implementé la Opción B porque prioricé dos mejoras más generales y reutilizables para conversión: una enfocada en aumentar el valor del carrito y otra enfocada en reforzar confianza antes de la compra.

### Demo en Shopify

Las mejoras del Reto 2 fueron probadas en una development store:

```text
https://healthy-america-assessment.myshopify.com/
```

Tema usado en la tienda de prueba:

```text
dawn-healthy-america-assessment-v2
```

Para validar la Opción A, abrir un producto, agregarlo al carrito y abrir el cart drawer desde el ícono del carrito. Para validar la Opción C, revisar la sección `Trust badges` agregada en la homepage.

## Opción A - Barra de progreso de envío gratis

Se agregó una barra de progreso dentro del cart drawer para mostrar cuánto le falta al usuario para alcanzar el envío gratis.

Umbrales considerados:

- Cali: $100.000 COP
- Nacional: $150.000 COP

La barra se actualiza cuando el usuario agrega, elimina o modifica cantidades en el carrito, aprovechando el render AJAX que Dawn ya trae para el cart drawer.

### Archivos modificados

- `layout/theme.liquid`
- `sections/cart-drawer.liquid`
- `snippets/cart-drawer.liquid`
- `assets/component-cart-drawer.css`

### Decisiones técnicas

El cart drawer originalmente se renderizaba como snippet desde `layout/theme.liquid`. Para permitir configuración desde el customizer, cambié la carga a una sección:

```liquid
{%- section 'cart-drawer' -%}
```
_________________________

## Reto 3 - Integración de API y automatización

El código del Reto 3 está en:

```text
reto-3-webhook/
```

Implementé un servicio Node.js con Express que recibe el webhook `orders/paid` de Shopify, valida la firma HMAC, transforma el payload de la orden y lo reenvía a un endpoint mock de Webhook.site.

### Archivos principales

- `reto-3-webhook/src/server.js`: servidor Express y endpoint `POST /webhooks/orders-paid`.
- `reto-3-webhook/src/shopify.js`: validación HMAC de Shopify.
- `reto-3-webhook/src/transformer.js`: transformación del payload de orden.
- `reto-3-webhook/src/emailMarketingClient.js`: envío a Webhook.site con reintentos.
- `reto-3-webhook/scripts/send-test-webhook.js`: script local para probar el webhook con HMAC válido.
- `reto-3-webhook/README.md`: instrucciones completas de setup y prueba.

### Setup rápido

```bash
cd reto-3-webhook
npm install
cp .env.example .env
```

Variables requeridas:

```env
PORT=3000
SHOPIFY_WEBHOOK_SECRET=your_shopify_app_client_secret
EMAIL_MARKETING_ENDPOINT=https://webhook.site/your-endpoint
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_SHOP_DOMAIN=healthy-america-assessment.myshopify.com
```

El archivo `.env.example` no incluye credenciales reales por seguridad. Esa es la practica correcta: el repositorio documenta que variables se necesitan, pero cada evaluador puede crear su propio `.env` local.

Para prueba local sin credenciales reales de Shopify se puede usar:

```env
SHOPIFY_WEBHOOK_SECRET=test_secret_123
EMAIL_MARKETING_ENDPOINT=https://webhook.site/tu-url-unica
```

El script `npm run test:webhook` usa ese secreto local para generar una firma HMAC válida y simular lo que haría Shopify.

### Ejecutar localmente

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

### Probar webhook local firmado

Con el servidor corriendo:

```bash
npm run test:webhook
```

Respuesta esperada:

```json
{"ok":true,"forwarded":true,"attempt":1}
```

Esta prueba genera una orden falsa, calcula el HMAC con `SHOPIFY_WEBHOOK_SECRET` y envía el request a `/webhooks/orders-paid`. Si el HMAC es válido, el servicio transforma la orden y la reenvía a Webhook.site.

### Probar con ngrok

```bash
ngrok http 3000
```

En Shopify se configuraría el webhook `orders/paid` apuntando a:

```text
https://TU-SUBDOMINIO.ngrok-free.app/webhooks/orders-paid
```

### Validaciones realizadas

- `GET /health` respondió `{"ok":true}`.
- `npm run test:webhook` respondió `{"ok":true,"forwarded":true,"attempt":1}`.
- Una prueba con HMAC inválido respondió `401 Unauthorized`.

El bonus de GraphQL no quedó implementado completamente; dejé el campo `isFirstOrder` preparado y documentado como mejora futura usando `SHOPIFY_ADMIN_ACCESS_TOKEN`.
