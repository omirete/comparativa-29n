(function () {
  'use strict';

  var DATA = window.PROPUESTAS;
  var REPO = 'https://github.com/omirete/comparativa-29n';
  // Enlace a una incidencia de GitHub con el partido y el tema ya rellenados
  function issueUrl(p, tema) {
    var q = 'template=correccion.yml' +
      '&title=' + encodeURIComponent('[Corrección] ' + p.nombre + (tema ? ' · ' + tema.nombre : '')) +
      '&partido=' + encodeURIComponent(p.nombre) +
      (tema ? '&tema=' + encodeURIComponent(tema.nombre) : '');
    return REPO + '/issues/new?' + q;
  }
  var TEMAS = [
    { id: 'economia', nombre: 'Economía e impuestos', desc: 'Impuestos, gasto público, deuda y modelo económico.' },
    { id: 'empleo', nombre: 'Empleo y salarios', desc: 'Salario mínimo, jornada, contratación, despido y autónomos.' },
    { id: 'vivienda', nombre: 'Vivienda', desc: 'Alquiler, compra, vivienda pública, desahucios y ocupación.' },
    { id: 'pensiones', nombre: 'Pensiones', desc: 'Cuantía, revalorización, edad de jubilación y financiación del sistema.' },
    { id: 'sanidad', nombre: 'Sanidad', desc: 'Sistema público, listas de espera, profesionales, salud mental y nuevas prestaciones.' },
    { id: 'educacion', nombre: 'Educación', desc: 'Leyes educativas, financiación, ratios, conciertos, becas y universidad.' },
    { id: 'inmigracion', nombre: 'Inmigración', desc: 'Entrada, regularización, expulsiones, asilo, nacionalidad e integración.' },
    { id: 'energia', nombre: 'Energía y medio ambiente', desc: 'Nuclear, renovables, precios de la energía, clima y agua.' },
    { id: 'social', nombre: 'Familia, igualdad y derechos sociales', desc: 'Natalidad y crianza, igualdad, violencia de género, aborto, cuidados y otros derechos.' },
    { id: 'instituciones', nombre: 'Instituciones, justicia y modelo de Estado', desc: 'Poder judicial, corrupción, sistema electoral, forma de Estado y comunidades autónomas.' },
    { id: 'defensa', nombre: 'Defensa y política exterior', desc: 'OTAN, gasto militar, Fuerzas Armadas y relaciones internacionales.' }
  ];
  var TEMA_BY_ID = {};
  TEMAS.forEach(function (t) { TEMA_BY_ID[t.id] = t; });

  // ---- orden de partidos: aleatorio por visita (Fisher-Yates) o alfabético ----
  var aleatorio = DATA.partidos.slice();
  for (var i = aleatorio.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = aleatorio[i]; aleatorio[i] = aleatorio[j]; aleatorio[j] = tmp;
  }
  var alfabetico = DATA.partidos.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });

  var state = {
    view: 'tema',
    tema: 'vivienda',
    orden: 'aleatorio',
    sel: DATA.partidos.map(function (p) { return p.id; }),
    partido: null,
    q: ''
  };

  // ---- utilidades ----
  function $(s) { return document.querySelector(s); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function fold(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function ordenados() { return state.orden === 'alfabetico' ? alfabetico : aleatorio; }
  function pdfLink(p, pagina) {
    return el('a', {
      class: 'pg', href: p.pdf + '#page=' + pagina, target: '_blank', rel: 'noopener',
      title: 'Abrir el programa de ' + p.nombre + ' en la página ' + pagina,
      text: 'pág. ' + pagina
    });
  }
  function listaPropuestas(p, temaId) {
    var items = (p.propuestas[temaId] || []);
    if (!items.length) {
      return el('p', { class: 'empty', text: 'El programa no incluye propuestas específicas sobre este tema.' });
    }
    return el('ul', { class: 'props' }, items.map(function (it) {
      var li = el('li');
      li.appendChild(document.createTextNode(it.texto + ' '));
      li.appendChild(pdfLink(p, it.pagina));
      return li;
    }));
  }

  // ---- URL (para compartir una vista concreta) ----
  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (h.get('vista')) state.view = h.get('vista');
    if (h.get('tema') && TEMA_BY_ID[h.get('tema')]) state.tema = h.get('tema');
    if (h.get('partidos')) {
      var ids = h.get('partidos').split(',').filter(function (id) { return DATA.partidos.some(function (p) { return p.id === id; }); });
      if (ids.length) state.sel = ids;
    }
    if (h.get('partido')) state.partido = h.get('partido');
    if (h.get('orden') === 'alfabetico') state.orden = 'alfabetico';
    if (h.get('q')) state.q = h.get('q');
  }
  function writeHash() {
    var h = new URLSearchParams();
    h.set('vista', state.view);
    if (state.view === 'tema') {
      h.set('tema', state.tema);
      if (state.sel.length !== DATA.partidos.length) h.set('partidos', state.sel.join(','));
      if (state.orden !== 'aleatorio') h.set('orden', state.orden);
    } else if (state.view === 'partido' && state.partido) {
      h.set('partido', state.partido);
    } else if (state.view === 'buscar' && state.q) {
      h.set('q', state.q);
    }
    history.replaceState(null, '', '#' + h.toString());
  }

  // ---- vistas ----
  function setView(v) {
    state.view = v;
    document.querySelectorAll('.tab').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v)); });
    document.querySelectorAll('.view').forEach(function (s) { s.hidden = s.id !== 'view-' + v; });
    render();
  }

  function renderTema() {
    var t = TEMA_BY_ID[state.tema];
    $('#tema-desc').textContent = t.desc;
    var grid = $('#grid-tema');
    grid.innerHTML = '';
    ordenados().forEach(function (p) {
      if (state.sel.indexOf(p.id) === -1) return;
      grid.appendChild(el('article', { class: 'card' }, [
        el('h3', { text: p.nombre }),
        el('p', { class: 'sub', text: (p.corto !== p.nombre ? p.corto + ' · ' : '') + '«' + p.titulo + '»' }),
        listaPropuestas(p, state.tema),
        el('p', { class: 'src' }, [
          el('a', { href: p.pdf, target: '_blank', rel: 'noopener', text: 'Programa completo (PDF, ' + p.paginas + ' págs.)' }),
          document.createTextNode(' · '),
          el('a', { href: issueUrl(p, t), target: '_blank', rel: 'noopener', title: 'Abre un formulario en GitHub con el partido y el tema ya rellenados', text: 'Avisar de un error' })
        ])
      ]));
    });
    if (!grid.children.length) grid.appendChild(el('p', { class: 'hint', text: 'Selecciona al menos un partido.' }));
  }

  function renderPartido() {
    var p = DATA.partidos.filter(function (x) { return x.id === state.partido; })[0] || ordenados()[0];
    state.partido = p.id;
    $('#sel-partido').value = p.id;
    var box = $('#ficha-partido');
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'ficha-head' }, [
      el('h2', { text: p.nombre }),
      el('p', {}, [
        document.createTextNode('«' + p.titulo + '» · ' + p.paginas + ' páginas · '),
        el('a', { href: p.pdf, target: '_blank', rel: 'noopener', text: 'Abrir el programa (PDF)' }),
        document.createTextNode(' · '),
        el('a', { href: issueUrl(p, null), target: '_blank', rel: 'noopener', text: 'Avisar de un error' })
      ])
    ]));
    TEMAS.forEach(function (t) {
      box.appendChild(el('section', { class: 'ficha-sec' }, [el('h3', { text: t.nombre }), listaPropuestas(p, t.id)]));
    });
  }

  function highlight(text, q) {
    var f = fold(text), fq = fold(q);
    var out = document.createDocumentFragment(), pos = 0, idx;
    if (!fq) { out.appendChild(document.createTextNode(text)); return out; }
    while ((idx = f.indexOf(fq, pos)) !== -1) {
      out.appendChild(document.createTextNode(text.slice(pos, idx)));
      out.appendChild(el('mark', { text: text.slice(idx, idx + fq.length) }));
      pos = idx + fq.length;
    }
    out.appendChild(document.createTextNode(text.slice(pos)));
    return out;
  }

  function renderBuscar() {
    var q = state.q.trim();
    var box = $('#q-results');
    box.innerHTML = '';
    if (q.length < 2) { $('#q-count').textContent = 'Escribe al menos dos letras. La búsqueda no distingue mayúsculas ni tildes.'; return; }
    var fq = fold(q), n = 0;
    ordenados().forEach(function (p) {
      TEMAS.forEach(function (t) {
        (p.propuestas[t.id] || []).forEach(function (it) {
          if (fold(it.texto).indexOf(fq) === -1) return;
          n++;
          var div = el('div', { class: 'result' }, [el('div', { class: 'meta', text: p.nombre + ' · ' + t.nombre })]);
          var body = el('div');
          body.appendChild(highlight(it.texto, q));
          body.appendChild(document.createTextNode(' '));
          body.appendChild(pdfLink(p, it.pagina));
          div.appendChild(body);
          box.appendChild(div);
        });
      });
    });
    $('#q-count').textContent = n === 1 ? '1 propuesta encontrada.' : n + ' propuestas encontradas.';
  }

  function renderMetodo() {
    var box = $('#lista-programas');
    if (box.children.length) return;
    var tb = el('tbody');
    alfabetico.forEach(function (p) {
      var total = 0, temas = 0;
      TEMAS.forEach(function (t) { var k = (p.propuestas[t.id] || []).length; total += k; if (k) temas++; });
      tb.appendChild(el('tr', {}, [
        el('td', {}, [el('a', { href: p.pdf, target: '_blank', rel: 'noopener', text: p.nombre })]),
        el('td', { text: '«' + p.titulo + '»' }),
        el('td', { text: String(p.paginas) }),
        el('td', { text: total + ' en ' + temas + ' de ' + TEMAS.length + ' temas' })
      ]));
    });
    box.appendChild(el('table', { class: 'programas' }, [
      el('thead', {}, [el('tr', {}, ['Partido', 'Título del programa', 'Páginas', 'Propuestas recogidas'].map(function (h) { return el('th', { text: h }); }))]),
      tb
    ]));
  }

  function render() {
    if (state.view === 'tema') renderTema();
    else if (state.view === 'partido') renderPartido();
    else if (state.view === 'buscar') renderBuscar();
    else renderMetodo();
    writeHash();
  }

  // ---- controles ----
  function buildControls() {
    var selTema = $('#sel-tema');
    TEMAS.forEach(function (t) { selTema.appendChild(el('option', { value: t.id, text: t.nombre })); });
    selTema.value = state.tema;
    selTema.addEventListener('change', function () { state.tema = selTema.value; render(); });

    $('#sel-orden').value = state.orden;
    $('#sel-orden').addEventListener('change', function (e) { state.orden = e.target.value; buildChips(); buildPartidoSelect(); render(); });

    buildChips();
    buildPartidoSelect();

    var q = $('#q');
    q.value = state.q;
    q.addEventListener('input', function () { state.q = q.value; render(); });

    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });
    document.querySelectorAll('[data-goto]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); setView(a.dataset.goto); window.scrollTo(0, 0); });
    });
  }
  function buildChips() {
    var box = $('#chk-partidos');
    box.innerHTML = '';
    ordenados().forEach(function (p) {
      var cb = el('input', { type: 'checkbox', value: p.id });
      cb.checked = state.sel.indexOf(p.id) !== -1;
      cb.addEventListener('change', function () {
        state.sel = ordenados().map(function (x) { return x.id; }).filter(function (id) {
          return box.querySelector('input[value="' + id + '"]').checked;
        });
        render();
      });
      box.appendChild(el('label', { class: 'chip' }, [cb, document.createTextNode(p.corto)]));
    });
  }
  function buildPartidoSelect() {
    var s = $('#sel-partido');
    s.innerHTML = '';
    ordenados().forEach(function (p) { s.appendChild(el('option', { value: p.id, text: p.nombre })); });
    if (state.partido) s.value = state.partido;
    s.onchange = function () { state.partido = s.value; render(); };
  }

  readHash();
  buildControls();
  setView(['tema', 'partido', 'buscar', 'metodo'].indexOf(state.view) !== -1 ? state.view : 'tema');
})();
