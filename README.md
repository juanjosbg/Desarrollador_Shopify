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