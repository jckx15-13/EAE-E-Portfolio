(function () {
  /* Thin loader: fetches portfolio data from data.json and exposes it as
     window.PORTFOLIO_DATA. Fires a 'portfolio-data-ready' custom event once
     the data is available so dependent scripts can initialise safely.

     For local file:// usage (no server), falls back to a synchronous XHR
     so the page still works when opened directly from disk. */

  function setData(data) {
    window.PORTFOLIO_DATA = data;
    window.dispatchEvent(new Event('portfolio-data-ready'));
  }

  if (window.location.protocol === 'file:') {
    // Synchronous fallback for file:// — fetch() is blocked by CORS in this mode
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data.json', false); // synchronous
      xhr.send();
      if (xhr.status === 200 || xhr.status === 0) {
        setData(JSON.parse(xhr.responseText));
      } else {
        console.error('Failed to load data.json (file://):', xhr.status);
      }
    } catch (err) {
      console.error('Failed to load data.json (file://):', err);
    }
  } else {
    fetch('data.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { setData(d); })
      .catch(function (err) { console.error('Failed to load data.json:', err); });
  }
})();
