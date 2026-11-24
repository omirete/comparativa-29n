# Comparativa de programas electorales · 29N 2026

Web estática que compara, tema a tema, las propuestas de los programas electorales oficiales para las elecciones generales del 29 de noviembre de 2026. Cada propuesta enlaza a la página exacta del PDF original del que procede.

- **Web:** https://omirete.github.io/comparativa-29n/
- **Repositorio:** https://github.com/omirete/comparativa-29n
- **Programas originales (PDF):** [programas-electorales/](https://github.com/omirete/comparativa-29n/tree/main/programas-electorales)
- **Datos:** [data/propuestas.json](https://github.com/omirete/comparativa-29n/blob/main/data/propuestas.json)
- **Avisar de un error:** [abrir una incidencia](https://github.com/omirete/comparativa-29n/issues/new)

## Qué incluye

- **Por tema**: once temas comunes y una columna por partido; puedes elegir qué partidos comparar.
- **Por partido**: todas las propuestas recogidas de un partido, tema a tema.
- **Buscar**: búsqueda de texto en todas las propuestas (sin distinguir tildes ni mayúsculas).
- **Metodología**: criterios de selección, limitaciones y lista de programas analizados.

La vista actual se guarda en la URL (por ejemplo `#vista=tema&tema=vivienda&partidos=PP,PSOE`), así que puedes compartir una comparación concreta.

## Criterios de neutralidad

1. Mismos once temas para todos los partidos, fijados antes de leer los programas.
2. Hasta 7 propuestas por partido y tema, priorizando medidas concretas o medibles.
3. Redacción neutra, sin adjetivos valorativos; las expresiones propias de un partido van entre comillas «así».
4. Ningún color de partido ni valoración de viabilidad, coste o ideología.
5. Orden de partidos aleatorio en cada visita (se puede cambiar a alfabético).
6. Cada propuesta cita la página del PDF (la del visor, no la impresa) y enlaza a ella.
7. Si un programa no aborda un tema, se indica expresamente.

## Estructura

```
index.html                  Página principal
assets/styles.css           Estilos (modo claro y oscuro, adaptable a móvil)
assets/app.js               Lógica (sin dependencias)
data/propuestas.json        Datos: partidos, temas, propuestas y página de origen
data/propuestas.js          Los mismos datos, cargados por la web (funciona también abriendo el archivo en local)
programas-electorales/      PDFs oficiales de cada partido
scripts/verificar_paginas.py  Comprobación automática de las páginas citadas
```

## Publicar en GitHub Pages

La web es estática (HTML, CSS y JavaScript sin dependencias ni compilación), así que no necesita ningún flujo de trabajo:

1. Sube el repositorio a GitHub (rama `main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En uno o dos minutos la web estará en `https://<usuario>.github.io/comparativa-29n/`. Cada `push` a `main` la actualiza.

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## Editar o corregir una propuesta

Si no quieres tocar el código, [abre una incidencia](https://github.com/omirete/comparativa-29n/issues/new) indicando partido, tema y página del PDF. En la web, cada tarjeta tiene un enlace «Avisar de un error» que abre el formulario con el partido y el tema ya rellenados.

Para corregirlo tú mismo:


Edita `data/propuestas.json` y regenera `data/propuestas.js`:

```bash
python3 -c "import json;d=json.load(open('data/propuestas.json',encoding='utf-8'));open('data/propuestas.js','w',encoding='utf-8').write('window.PROPUESTAS = '+json.dumps(d,ensure_ascii=False)+';\n')"
python3 scripts/verificar_paginas.py   # opcional: revisa las páginas citadas
```

## Limitaciones

Es una selección, no un resumen exhaustivo: los programas tienen entre 31 y 141 páginas. Solo se han analizado los programas incluidos en `programas-electorales/`. La referencia válida es siempre el programa original.
