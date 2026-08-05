/* global React, Icon, Dropdown, MenuItem, MenuSep, MenuHead */
const { useEffect: useEffectDS } = React;

/* ---------------- DOCUMENT ---------------- */
function DocumentArea({ ctx }) {
  return React.createElement('div', { className: 'doc-area' },
    ctx.show.rulers && React.createElement('div', { className: 'h-ruler' },
      React.createElement('div', { className: 'h-ruler-inner', style: { transform: `scaleX(${ctx.zoom / 100})`, transformOrigin: 'center top' } }, React.createElement(RulerTicks, null))),
    React.createElement('div', { className: 'doc-scroll', ref: ctx.scrollRef },
      React.createElement('div', { style: { transform: `scale(${ctx.zoom / 100})`, transformOrigin: 'top center' } },
        React.createElement('div', {
          className: 'doc-page' + (ctx.darkDoc ? ' dark-doc' : ''),
          contentEditable: ctx.editMode !== 'Viewing',
          suppressContentEditableWarning: true,
          ref: ctx.docRef,
          onInput: ctx.onDocInput,
          onMouseUp: ctx.onSelChange,
          onKeyUp: ctx.onSelChange,
          dangerouslySetInnerHTML: { __html: SAMPLE_DOC },
        })
      )
    )
  );
}

function RulerTicks() {
  const ticks = [];
  for (let i = 0; i <= 16; i++) {
    ticks.push(React.createElement('div', {
      key: i, style: { position: 'absolute', left: i * 51 + 'px', top: 0, bottom: 0, width: 1, background: 'var(--ruler-line)', opacity: i % 2 ? 0.4 : 0.8, height: i % 2 ? '40%' : '70%', alignSelf: 'center' },
    }));
  }
  return React.createElement('div', { style: { position: 'relative', width: '100%', height: '100%' } }, ticks);
}

const SAMPLE_DOC = `
<h1 data-h="Project Brief">Project Brief</h1>
<p class="subtitle">Q3 Product Initiative &middot; Draft v2 &middot; Last edited today</p>
<p>This document outlines the scope, goals, and timeline for the upcoming initiative. It is intended to align the product, design, and engineering teams before kickoff. Edit any text directly — the formatting toolbar above is fully wired to this canvas.</p>
<h2 data-h="Overview">Overview</h2>
<p>We are building a streamlined document editing experience with a familiar ribbon interface. The aim is to reduce the time it takes new users to find common formatting tools, while keeping advanced options one click away in the side panels.</p>
<p>Select some text and try <b>bold</b>, <i>italic</i>, or change the <u>alignment</u> — every control reflects the current selection's state.</p>
<h2 data-h="Goals &amp; Scope">Goals &amp; Scope</h2>
<p>The first release focuses on the core authoring loop: typing, formatting, inserting tables and images, and reviewing changes with collaborators. Anything outside that loop is explicitly out of scope for v1.</p>
<h2 data-h="Timeline">Timeline</h2>
<p>Design sign-off is targeted for the end of this month, with engineering build starting immediately after. A beta is planned for mid-quarter.</p>
<h2 data-h="Milestones">Milestones</h2>
<p>Key checkpoints include the design review, the internal alpha, the closed beta, and the general availability launch. Each milestone has an owner and a clearly defined exit criterion.</p>
<h2 data-h="Deliverables">Deliverables</h2>
<p>Deliverables for this phase include the annotated wireframes, the component specification, and this brief. Final artifacts will be linked here as they are completed.</p>
`;

/* ---------------- STATUS BAR ---------------- */
function StatusBar({ ctx }) {
  return React.createElement('div', { className: 'statusbar' },
    React.createElement('button', { className: 'sb-btn' }, `Page ${ctx.curPage} of ${ctx.pageCount}`),
    React.createElement('button', { className: 'sb-btn' }, `${ctx.wordCount} words`),
    React.createElement('span', { style: { width: 8 } }),
    React.createElement('button', { className: 'sb-btn' }, React.createElement(Icon, { n: 'thesaurus', size: 14 }), 'Word count'),
    React.createElement(Dropdown, {
      render: ({ ref, onClick }) => React.createElement('button', { ref, onClick, className: 'sb-btn' }, ctx.language, React.createElement(Icon, { n: 'chevup', size: 12 })),
      menu: (close) => React.createElement('div', null,
        ['English (US)', 'English (UK)', 'French', 'German', 'Spanish'].map((l) =>
          React.createElement(MenuItem, { key: l, label: l, checked: ctx.language === l, onClick: () => ctx.setLanguage(l), close }))),
    }),
    React.createElement('button', { className: 'sb-btn' + (ctx.spellcheck ? '' : ''), onClick: ctx.toggleSpell, style: { color: ctx.spellcheck ? 'var(--accent)' : 'var(--text-secondary)' } },
      React.createElement(Icon, { n: 'check', size: 14 }), 'Spell check'),
    React.createElement('span', { className: 'sb-sep' }),
    React.createElement('button', { className: 'sb-btn', title: 'Fit to page', onClick: () => ctx.setFit('page') }, React.createElement(Icon, { n: 'fitpage', size: 15 })),
    React.createElement('button', { className: 'sb-btn', title: 'Fit to width', onClick: () => ctx.setFit('width') }, React.createElement(Icon, { n: 'fitwidth', size: 15 })),
    React.createElement('div', { className: 'sb-zoom' },
      React.createElement('button', { className: 'sb-btn', onClick: () => ctx.setZoom(Math.max(50, ctx.zoom - 10)) }, '\u2212'),
      React.createElement('input', { type: 'range', min: 50, max: 200, step: 5, value: ctx.zoom, onChange: (e) => ctx.setZoom(+e.target.value) }),
      React.createElement('button', { className: 'sb-btn', onClick: () => ctx.setZoom(Math.min(200, ctx.zoom + 10)) }, '+'),
      React.createElement('span', { className: 'sb-zoom-val' }, ctx.zoom + '%'))
  );
}

/* ---------------- FILE BACKSTAGE ---------------- */
function Backstage({ ctx }) {
  const items = ['Recent', 'New', 'Open', 'Save', 'Save copy as', 'Print', 'Document Info', 'Settings'];
  const [sel, setSel] = React.useState('Document Info');
  return React.createElement('div', { className: 'backstage' },
    React.createElement('div', { className: 'bs-side' },
      React.createElement('div', { className: 'bs-back', onClick: ctx.closeBackstage },
        React.createElement(Icon, { n: 'prevchange', size: 18 }), 'Back to editor'),
      React.createElement('div', { style: { height: 8 } }),
      items.map((it) => React.createElement('div', {
        key: it, className: 'bs-item' + (sel === it ? ' active' : ''), onClick: () => setSel(it),
      }, it))
    ),
    React.createElement('div', { className: 'bs-main' },
      sel === 'Document Info'
        ? React.createElement('div', null,
            React.createElement('h2', null, 'Document Info'),
            React.createElement(InfoGrid, { rows: [
              ['Title', ctx.docName], ['Author', 'Craig McMeechan'], ['Location', 'My Documents / Drafts'],
              ['Created', 'May 10, 2026'], ['Last modified', 'Today, 2:14 PM'], ['Pages', String(ctx.pageCount)],
              ['Words', String(ctx.wordCount)], ['File size', '38 KB'],
            ] }))
        : React.createElement('div', null,
            React.createElement('h2', null, sel),
            React.createElement('p', { style: { color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 } },
              'This is the ' + sel + ' view of the file backstage. In a full editor this panel would host the corresponding actions and options.'),
            React.createElement('button', { className: 'btn primary', style: { marginTop: 14 }, onClick: ctx.closeBackstage }, 'Return to document'))
    )
  );
}
function InfoGrid({ rows }) {
  return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 12, maxWidth: 480 } },
    rows.flatMap(([k, v], i) => [
      React.createElement('div', { key: 'k' + i, style: { color: 'var(--text-secondary)', fontSize: 13 } }, k),
      React.createElement('div', { key: 'v' + i, style: { fontSize: 13, fontWeight: 500 } }, v),
    ]));
}

/* ---------------- MODAL DIALOGS ---------------- */
function Modal({ title, onClose, children, width = 460 }) {
  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); },
  },
    React.createElement('div', { style: { width, maxWidth: '92vw', background: 'var(--popover-bg)', borderRadius: 6, boxShadow: '0 18px 60px rgba(0,0,0,0.35)', overflow: 'hidden', color: 'var(--text-normal)' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-divider)' } },
        React.createElement('span', { style: { fontWeight: 600, fontSize: 15 } }, title),
        React.createElement('button', { className: 'lp-close', onClick: onClose }, React.createElement(Icon, { n: 'close', size: 18 }))),
      React.createElement('div', { style: { padding: 18 } }, children))
  );
}

function ShareDialog({ ctx }) {
  const people = [
    { who: 'Craig McMeechan', role: 'Owner', color: '#3d6fd1' },
    { who: 'Maria Lin', role: 'Can edit', color: '#70ad47' },
    { who: 'Alex Doe', role: 'Can comment', color: '#5b9bd5' },
  ];
  return React.createElement(Modal, { title: 'Sharing Settings', onClose: ctx.closeShare, width: 500 },
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
      React.createElement('input', { className: 'text-input', placeholder: 'Add people or groups by email\u2026' }),
      React.createElement('button', { className: 'btn primary' }, 'Invite')),
    people.map((p, i) => React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' } },
      React.createElement('span', { style: { width: 30, height: 30, borderRadius: '50%', background: p.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 } }, p.who.split(' ').map((s) => s[0]).join('')),
      React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { style: { fontWeight: 500 } }, p.who)),
      React.createElement('span', { style: { color: 'var(--text-secondary)', fontSize: 12 } }, p.role))),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-divider)' } },
      React.createElement(Icon, { n: 'hyperlink', size: 18 }),
      React.createElement('input', { className: 'text-input', readOnly: true, value: 'https://docs.example.com/d/new-document' }),
      React.createElement('button', { className: 'btn' }, 'Copy'))
  );
}

function PluginsDialog({ ctx }) {
  const plugins = [
    { n: 'translate', name: 'Translator', desc: 'Translate selected text to 40+ languages.' },
    { n: 'speech', name: 'Speech', desc: 'Convert text to spoken audio.' },
    { n: 'code', name: 'Highlight code', desc: 'Syntax-highlight code snippets.' },
    { n: 'imagegen', name: 'Photo Editor', desc: 'Edit images without leaving the doc.' },
    { n: 'ai', name: 'AI Assistant', desc: 'Summarize, rewrite, and generate text.' },
    { n: 'symbol', name: 'Thesaurus', desc: 'Find synonyms and antonyms.' },
  ];
  return React.createElement(Modal, { title: 'Plugin Manager', onClose: ctx.closePlugins, width: 560 },
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
      plugins.map((p, i) => React.createElement('div', { key: i, style: { border: '1px solid var(--border-divider)', borderRadius: 6, padding: 12, display: 'flex', gap: 10 } },
        React.createElement('span', { style: { width: 34, height: 34, borderRadius: 7, background: 'var(--btn-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--accent)' } }, React.createElement(Icon, { n: p.n, size: 20 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontWeight: 600, marginBottom: 3 } }, p.name),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 } }, p.desc),
          React.createElement('button', { className: 'btn', style: { padding: '3px 10px', fontSize: 11 } }, 'Run')))))
  );
}

Object.assign(window, { DocumentArea, StatusBar, Backstage, ShareDialog, PluginsDialog });
