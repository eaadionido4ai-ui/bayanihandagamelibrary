/* The small cap icon beside a credited name. Tapping it shows or hides the person's other affiliations,
   which are listed once, in games/shared/people.json (the app shell reads the same file). The build puts
   this file and the list (as PEOPLE) into every game page and the tour, so it works offline.

   affIcon(name, id)  the button, for right after the name ('' when the person has no other affiliation)
   affMore(name, id)  the hidden lines the button shows, for where they read best (after the person's office)

   A page written as plain HTML can use placeholders instead, which are filled in when the page loads:
   <span data-aff-icon="Name" data-aff="id"></span> and <span data-aff-more="Name" data-aff="id"></span>
   Plain ES5, so it runs wherever the games run. */
(function () {
  var P = window.PEOPLE || {};
  var CAP = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"'
    + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
    + '<path d="M2 9.5L12 5l10 4.5L12 14z"></path><path d="M6.5 11.8V16c1.6 1.4 3.4 2 5.5 2s3.9-.6 5.5-2v-4.2"></path>'
    + '<path d="M22 9.5V15"></path></svg>';
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function icon(name, id) {
    if (!P[name]) return '';
    return '<button type="button" class="aff-btn" aria-expanded="false" aria-controls="' + esc(id) + '" aria-label="'
      + esc('Other affiliation of ' + name) + '" title="Other affiliation">' + CAP + '</button>';
  }
  function more(name, id) {
    var a = P[name], h;
    if (!a) return '';
    h = '<span class="aff-more" id="' + esc(id) + '" hidden><span class="aff-lab">Also</span>';
    for (var i = 0; i < a.length; i++) h += '<span class="aff-l' + (i ? '' : ' aff-1') + '">' + esc(a[i]) + '</span>';
    return h + '</span>';
  }
  function fill(root) {
    var els = (root || document).querySelectorAll('[data-aff-icon],[data-aff-more]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], isIcon = el.hasAttribute('data-aff-icon');
      var name = el.getAttribute(isIcon ? 'data-aff-icon' : 'data-aff-more'), id = el.getAttribute('data-aff');
      el.outerHTML = isIcon ? icon(name, id) : more(name, id);
    }
  }
  window.affIcon = icon;
  window.affMore = more;
  window.affFill = fill;

  // One listener for the whole page, so it keeps working when a page redraws its sheets.
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.aff-btn') : null, m;
    if (!b) return;
    m = document.getElementById(b.getAttribute('aria-controls'));
    if (!m) return;
    m.hidden = !m.hidden;
    b.setAttribute('aria-expanded', m.hidden ? 'false' : 'true');
  });

  // Colors follow the text around them, so the icon fits light and dark sheets alike.
  var st = document.createElement('style');
  st.textContent = '.aff-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;'
    + 'margin:-5px 0 -5px 3px;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;opacity:.62;'
    + 'cursor:pointer;vertical-align:middle;font:inherit;-webkit-tap-highlight-color:transparent}'
    + '.aff-btn:hover{opacity:1;background:rgba(127,127,127,.14)}'
    + '.aff-btn[aria-expanded="true"]{opacity:1;background:rgba(127,127,127,.2)}'
    + '.aff-btn:focus-visible{outline:2px solid currentColor;outline-offset:1px;opacity:1}'
    + '.aff-btn svg{display:block}'
    + '.aff-more{display:flex;flex-direction:column;gap:1px;width:-moz-fit-content;width:fit-content;max-width:100%;'
    + 'margin:6px 0 10px;padding:7px 12px;border-radius:12px;background:rgba(127,127,127,.09);'
    + 'border:1.5px solid rgba(127,127,127,.24);font-size:13px;font-weight:700;line-height:1.35;text-align:inherit;'
    + 'font-family:inherit;color:inherit;box-sizing:border-box}'
    + '.aff-more[hidden]{display:none}'
    + '.aff-lab{font-size:10.5px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;opacity:.75}'
    + '.aff-1{font-weight:900}';
  (document.head || document.documentElement).appendChild(st);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { fill(document); });
  else fill(document);
})();
