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

// Anmeldung: Brevo antwortet mit JSON, nicht mit einer HTML-Seite.
// Deshalb gehen wir nach Erfolg selbst auf /bitte-bestaetigen/.
// Liegt in Brevo eine Weiterleitung auf tueseinfach.com, nehmen wir die.
(function () {
  var formulare = document.querySelectorAll('.anmeldung-form');
  if (!formulare.length) return;

  function eigenesZiel(url) {
    return typeof url === 'string' && /^https:\/\/(www\.)?tueseinfach\.com\//.test(url);
  }

  function zeigFehler(form, text) {
    var feld = form.parentElement.querySelector('.anmeldung-fehler');
    if (!feld) return;
    feld.hidden = false;
    feld.textContent = text;
  }

  formulare.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var honig = form.querySelector('[name="email_address_check"]');
      var knopf = form.querySelector('button[type="submit"]');
      var fehler = form.parentElement.querySelector('.anmeldung-fehler');
      if (fehler) { fehler.hidden = true; fehler.textContent = ''; }
      if (honig && honig.value) {
        window.location.href = '/bitte-bestaetigen/';
        return;
      }
      var vorher = knopf.textContent;
      knopf.disabled = true;
      knopf.textContent = 'Wird gesendet …';
      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      }).then(function (antwort) {
        return antwort.json().then(function (daten) { return daten || {}; });
      }).then(function (daten) {
        if (daten.success) {
          window.location.href = eigenesZiel(daten.redirect) ? daten.redirect : '/bitte-bestaetigen/';
          return;
        }
        var text = 'Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch es noch einmal.';
        if (daten.errors) {
          var namen = Object.keys(daten.errors);
          if (namen.length && typeof daten.errors[namen[0]] === 'string') text = daten.errors[namen[0]];
        } else if (typeof daten.message === 'string' && daten.message) {
          text = daten.message;
        }
        zeigFehler(form, text);
        knopf.disabled = false;
        knopf.textContent = vorher;
      }).catch(function () {
        zeigFehler(form, 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal.');
        knopf.disabled = false;
        knopf.textContent = vorher;
      });
    });
  });
})();
