# Reimplementazione futura del tracking Umami

Il tracking è intenzionalmente disabilitato. Questa guida documenta come ripristinarlo senza modificare il comportamento delle CTA e senza inserire dati personali negli eventi.

## Prerequisiti

1. Creare il sito nel pannello Umami e ottenere il website ID pubblico.
2. Definire dominio, finalità, conservazione e accessi ai dati.
3. Verificare gli obblighi informativi e l’eventuale necessità di consenso applicabile al servizio e alla configurazione scelti.
4. Non inserire segreti, token amministrativi o dati personali nel repository.

## Configurazione

Creare `js/analytics-config.js`:

```javascript
window.LC_ANALYTICS = {
  umamiWebsiteId: '00000000-0000-0000-0000-000000000000',
  umamiScriptUrl: 'https://cloud.umami.is/script.js'
};
```

Caricarlo prima di `js/main.js` in `index.html` e `productos.html`:

```html
<script src="js/analytics-config.js"></script>
<script src="js/main.js" defer></script>
```

## Loader condizionale

Richiamare `initAnalytics()` all’avvio e aggiungere a `js/main.js`:

```javascript
function initAnalytics() {
  const config = window.LC_ANALYTICS;
  if (!config || typeof config.umamiWebsiteId !== 'string' || !config.umamiWebsiteId.trim()) return;
  if (document.querySelector('script[data-website-id]')) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = config.umamiScriptUrl || 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = config.umamiWebsiteId.trim();
  document.head.appendChild(script);
}
```

Con un website ID vuoto non deve essere creata alcuna richiesta analytics.

## Eventi previsti

| Evento | Placement | Elemento |
| --- | --- | --- |
| `turbopos-click` | `hero` | CTA principale “Haz tu pedido” |
| `turbopos-click` | `navbar` | Eventuale CTA TurboPOS nella navigazione |
| `turbopos-click` | `location` | CTA ordini nella sezione contatti |
| `turbopos-click` | `products-banner` | CTA prodotti generata da JavaScript |
| `phone-click` | `hero` | Numero telefonico nell’hero |
| `phone-click` | `location` | Pulsante telefonico nella sezione contatti |

Non inviare numero telefonico, lingua, testo libero, indirizzo IP aggiuntivo o altri identificatori come proprietà evento.

## Elementi HTML

```html
<a
  href="https://losclandestinos.turbopos.es/"
  data-umami-event="turbopos-click"
  data-umami-event-placement="hero"
>
  HAZ TU PEDIDO
</a>
```

```html
<a
  href="tel:+34856941295"
  data-umami-event="phone-click"
  data-umami-event-placement="location"
>
  Llamar ahora
</a>
```

## CTA generata da JavaScript

Per la CTA inserita da `initCtaBanner()`, aggiungere gli attributi direttamente al markup generato:

```html
<a
  href="https://losclandestinos.turbopos.es/"
  class="cta-banner__btn"
  data-umami-event="turbopos-click"
  data-umami-event-placement="products-banner"
>
```

## Checklist di verifica

- Il sito funziona normalmente quando il website ID è vuoto o il provider non risponde.
- Lo script Umami viene caricato una sola volta e soltanto dopo la configurazione prevista.
- Ogni click compare una sola volta nella dashboard con evento e placement corretti.
- CTA TurboPOS, link telefonici, `target="_blank"` e `rel="noopener"` mantengono il comportamento originale.
- Nessun payload contiene dati personali o testo libero.
- Informativa, finalità e conservazione corrispondono alla configurazione effettiva.
- La verifica viene ripetuta su home e pagina prodotti, desktop e mobile.
