/* Adds a small floating "back to main portfolio" pill to every page of this
 * Google Sites export, so navigation between the two portfolios is two-way.
 * Injected via a single <script> tag added to each exported HTML file —
 * does not touch Google's own generated markup or styles. */
(function () {
  var link = document.createElement('a');
  link.href = '../../index.html';
  link.textContent = '← Main Portfolio';
  link.setAttribute('aria-label', 'Back to main EAE portfolio');
  link.style.cssText = [
    'position:fixed', 'top:12px', 'right:12px', 'z-index:999999',
    'display:inline-flex', 'align-items:center', 'gap:6px',
    'padding:8px 14px', 'border-radius:999px',
    'background:#1a73e8', 'color:#ffffff',
    'font-family:Roboto,Arial,sans-serif', 'font-size:13px', 'font-weight:700',
    'text-decoration:none', 'box-shadow:0 1px 3px rgba(0,0,0,0.3),0 4px 8px rgba(0,0,0,0.2)',
    'transition:transform 0.15s ease, box-shadow 0.15s ease'
  ].join(';');
  link.addEventListener('mouseenter', function () {
    link.style.transform = 'translateY(-1px)';
    link.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35),0 6px 14px rgba(0,0,0,0.25)';
  });
  link.addEventListener('mouseleave', function () {
    link.style.transform = 'none';
    link.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3),0 4px 8px rgba(0,0,0,0.2)';
  });
  document.body.appendChild(link);
})();
