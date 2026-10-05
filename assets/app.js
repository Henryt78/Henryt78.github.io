// Impuls des Tages: wechselt täglich, für alle Besucher gleich (nach Datum, ohne Server)
(function () {
  var box = document.getElementById('heute');
  if (box) {
    try {
      var list = JSON.parse(box.getAttribute('data-impulse'));
      var tag = Math.floor(Date.now() / 86400000);
      var x = list[tag % list.length];
      document.getElementById('heute-zitat').textContent = x.zitat;
      var a = document.getElementById('heute-link');
      a.href = '/impuls/' + x.slug + '/';
      a.textContent = x.title + ' lesen →';
    } catch (e) { /* Fallback bleibt stehen */ }
  }

  // Teilen: natives Teilen-Menü, sonst Link kopieren
  var btn = document.querySelector('.teilen');
  if (btn) {
    btn.addEventListener('click', function () {
      var data = { title: btn.dataset.title, text: btn.dataset.text, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          var alt = btn.textContent; btn.textContent = 'Link kopiert ✓';
          setTimeout(function () { btn.textContent = alt; }, 2000);
        });
      }
    });
  }
})();
