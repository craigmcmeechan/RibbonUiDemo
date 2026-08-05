/* global React, Icon, Dropdown, MenuItem, MenuSep, MenuHead, Check, SAFE_PALETTE, ColorGrid */
const { useState: useStateWS } = React;

/* ---------------- LEFT RAIL + PANEL ---------------- */
const LEFT_RAIL = [
  { id: 'search', icon: 'search', title: 'Find & Replace' },
  { id: 'comments', icon: 'comments', title: 'Comments' },
  { id: 'chat', icon: 'chat', title: 'Chat' },
  { id: 'navigation', icon: 'navigation', title: 'Navigation' },
  { id: 'feedback', icon: 'feedback', title: 'Feedback & Support' },
  { id: 'about', icon: 'about', title: 'About' },
];

function LeftRail({ ctx }) {
  return React.createElement('div', { className: 'left-rail' },
    LEFT_RAIL.map((b) => React.createElement('button', {
      key: b.id, className: 'rail-btn' + (ctx.leftPanel === b.id ? ' active' : ''),
      title: b.title, onClick: () => ctx.toggleLeftPanel(b.id),
    }, React.createElement(Icon, { n: b.icon })))
  );
}

function LeftPanel({ ctx }) {
  const id = ctx.leftPanel;
  const titles = { search: 'Find and replace', comments: 'Comments', chat: 'Chat', navigation: 'Navigation', feedback: 'Feedback & Support', about: 'About' };
  const bodies = {
    search: SearchPanel, comments: CommentsPanel, chat: ChatPanel,
    navigation: NavPanel, feedback: FeedbackPanel, about: AboutPanel,
  };
  const Body = bodies[id];
  return React.createElement('div', { className: 'left-panel' },
    React.createElement('div', { className: 'lp-head' },
      React.createElement('span', null, titles[id]),
      React.createElement('button', { className: 'lp-close', onClick: () => ctx.toggleLeftPanel(id) },
        React.createElement(Icon, { n: 'close', size: 16 }))
    ),
    React.createElement('div', { className: 'lp-body' }, React.createElement(Body, { ctx }))
  );
}

function SearchPanel({ ctx }) {
  const [find, setFind] = useStateWS('');
  const [cs, setCs] = useStateWS(false);
  const [ww, setWw] = useStateWS(false);
  return React.createElement('div', null,
    React.createElement('input', { className: 'text-input', placeholder: 'Find', value: find, onChange: (e) => setFind(e.target.value), style: { marginBottom: 8 } }),
    React.createElement('input', { className: 'text-input', placeholder: 'Replace with', style: { marginBottom: 8 } }),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0' } },
      React.createElement('span', { style: { color: 'var(--text-secondary)' } }, find ? '0 of 0' : 'No search results'),
      React.createElement('span', { style: { display: 'flex', gap: 2 } },
        React.createElement('button', { className: 'lp-close' }, React.createElement(Icon, { n: 'chevup', size: 15 })),
        React.createElement('button', { className: 'lp-close' }, React.createElement(Icon, { n: 'chevdown', size: 15 })))
    ),
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 12 } },
      React.createElement('button', { className: 'btn', disabled: !find }, 'Replace'),
      React.createElement('button', { className: 'btn', disabled: !find }, 'Replace All')),
    React.createElement(Check, { on: cs, label: 'Case sensitive', onClick: () => setCs(!cs) }),
    React.createElement(Check, { on: ww, label: 'Whole words only', onClick: () => setWw(!ww) })
  );
}

function CommentsPanel() {
  const comments = [
    { who: 'Alex Doe', when: 'May 14, 10:24 AM', text: 'Can we tighten this paragraph? It reads a little long.', color: '#5b9bd5' },
    { who: 'Maria Lin', when: 'May 14, 11:02 AM', text: 'Agreed — also the heading should match the style guide.', color: '#70ad47' },
  ];
  return React.createElement('div', null,
    React.createElement('button', { className: 'btn primary', style: { width: '100%', marginBottom: 12 } }, '+ Add comment'),
    comments.map((c, i) => React.createElement('div', { key: i, style: { background: 'var(--input-bg)', border: '1px solid var(--border-divider)', borderRadius: 4, padding: 10, marginBottom: 8 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 } },
        React.createElement('span', { style: { width: 22, height: 22, borderRadius: '50%', background: c.color, color: '#fff', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 } }, c.who.split(' ').map((s) => s[0]).join('')),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 600, fontSize: 11 } }, c.who),
          React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, c.when))),
      React.createElement('div', { style: { fontSize: 12, color: 'var(--text-normal)', lineHeight: 1.4 } }, c.text),
      React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-link)' } },
        React.createElement('span', { style: { cursor: 'pointer' } }, 'Reply'),
        React.createElement('span', { style: { cursor: 'pointer' } }, 'Resolve'))))
  );
}

function ChatPanel() {
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' } },
    React.createElement('div', { style: { flex: 1, overflowY: 'auto' } },
      [{ who: 'Maria Lin', text: 'Hi! I just joined the doc.', me: false }, { who: 'You', text: 'Great — I am working on the intro section.', me: true }].map((m, i) =>
        React.createElement('div', { key: i, style: { marginBottom: 10, textAlign: m.me ? 'right' : 'left' } },
          React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 } }, m.who),
          React.createElement('div', { style: { display: 'inline-block', background: m.me ? 'var(--accent)' : 'var(--input-bg)', color: m.me ? '#fff' : 'var(--text-normal)', border: m.me ? 'none' : '1px solid var(--border-divider)', borderRadius: 8, padding: '6px 10px', fontSize: 12, maxWidth: 200 } }, m.text)))),
    React.createElement('input', { className: 'text-input', placeholder: 'Type a message\u2026', style: { marginTop: 8 } })
  );
}

function NavPanel({ ctx }) {
  const items = [
    { t: 'Project Brief', lvl: 0 },
    { t: 'Overview', lvl: 1 },
    { t: 'Goals & Scope', lvl: 1 },
    { t: 'Timeline', lvl: 1 },
    { t: 'Milestones', lvl: 2 },
    { t: 'Deliverables', lvl: 1 },
  ];
  return React.createElement('div', null,
    items.map((it, i) => React.createElement('div', {
      key: i, onClick: () => ctx.scrollToHeading(it.t),
      style: { padding: '5px 6px', paddingLeft: 6 + it.lvl * 14, fontSize: 12, cursor: 'pointer', borderRadius: 3, color: it.lvl === 0 ? 'var(--text-normal)' : 'var(--text-secondary)', fontWeight: it.lvl === 0 ? 600 : 400 },
      onMouseEnter: (e) => e.currentTarget.style.background = 'var(--btn-hover)',
      onMouseLeave: (e) => e.currentTarget.style.background = 'transparent',
    }, it.t))
  );
}

function FeedbackPanel() {
  return React.createElement('div', null,
    React.createElement('p', { style: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 } }, 'Found a problem or have a suggestion? Let us know.'),
    React.createElement('textarea', { className: 'text-input', placeholder: 'Describe your feedback\u2026', style: { height: 120, padding: 8, resize: 'none', marginBottom: 10 } }),
    React.createElement('button', { className: 'btn primary', style: { width: '100%' } }, 'Send feedback')
  );
}

function AboutPanel() {
  return React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 } },
    React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: 'var(--text-normal)', marginBottom: 4 } }, 'Documents Editor'),
    React.createElement('div', null, 'Version 3.6.1'),
    React.createElement('div', { style: { marginTop: 10 } }, 'A ribbon-style document editor UI built in React.'),
    React.createElement('div', { style: { marginTop: 10 } }, 'Word count, formatting, collaboration and review tools included in this interactive prototype.')
  );
}

/* ---------------- RIGHT RAIL + PANEL ---------------- */
const RIGHT_RAIL = [
  { id: 'paragraph', icon: 'marks', title: 'Paragraph settings' },
  { id: 'table', icon: 'table', title: 'Table settings' },
  { id: 'image', icon: 'image', title: 'Image settings' },
  { id: 'shape', icon: 'shapes', title: 'Shape settings' },
  { id: 'text', icon: 'textart', title: 'Text Art settings' },
  { id: 'headerfooter', icon: 'header', title: 'Header & Footer settings' },
];

function RightRail({ ctx }) {
  return React.createElement('div', { className: 'right-rail' },
    RIGHT_RAIL.map((b) => React.createElement('button', {
      key: b.id, className: 'rail-btn' + (ctx.rightTab === b.id ? ' active' : ''),
      title: b.title, onClick: () => ctx.setRightTab(b.id),
    }, React.createElement(Icon, { n: b.icon })))
  );
}

function RightPanel({ ctx }) {
  const bodies = { paragraph: ParagraphSettings, table: TableSettings, image: ImageSettings, shape: ShapeSettings, text: TextSettings, headerfooter: HFSettings };
  const Body = bodies[ctx.rightTab] || ParagraphSettings;
  return React.createElement('div', { className: 'right-panel' },
    React.createElement('div', { className: 'rp-body' }, React.createElement(Body, { ctx }))
  );
}

function Field({ value, onClick }) { return React.createElement('div', { className: 'field select', onClick }, React.createElement('span', null, value)); }
function SpinField({ value, onUp, onDown }) {
  return React.createElement('div', { className: 'spin-field' },
    React.createElement('input', { value, readOnly: true }),
    React.createElement('span', { className: 'sp' },
      React.createElement('button', { onClick: onUp }, '\u25B2'),
      React.createElement('button', { onClick: onDown }, '\u25BC')));
}

function ParagraphSettings({ ctx }) {
  const [noInterval, setNoInterval] = useStateWS(false);
  return React.createElement('div', null,
    React.createElement('div', { className: 'rp-label' }, 'Line spacing'),
    React.createElement('div', { className: 'rp-row' },
      React.createElement('div', { className: 'rp-col' }, React.createElement(SpacingTypeSelect, { ctx })),
      React.createElement('div', { className: 'rp-col' }, React.createElement(SpinField, { value: ctx.lineSpacing, onUp: () => ctx.nudgeSpacing(0.05), onDown: () => ctx.nudgeSpacing(-0.05) }))),
    React.createElement('div', { className: 'rp-section-title', style: { marginTop: 16 } }, 'Paragraph spacing'),
    React.createElement('div', { className: 'rp-row' },
      React.createElement('div', { className: 'rp-col' }, React.createElement('div', { className: 'rp-label', style: { marginTop: 0 } }, 'Before'), React.createElement(SpinField, { value: '0 "', onUp: () => {}, onDown: () => {} })),
      React.createElement('div', { className: 'rp-col' }, React.createElement('div', { className: 'rp-label', style: { marginTop: 0 } }, 'After'), React.createElement(SpinField, { value: '0.14 "', onUp: () => {}, onDown: () => {} }))),
    React.createElement(Check, { on: noInterval, label: "Don't add interval between paragraphs of the same style", onClick: () => setNoInterval(!noInterval) }),
    React.createElement('div', { className: 'rp-divider' }),
    React.createElement('div', { className: 'rp-section-title' }, 'Indents'),
    React.createElement('div', { className: 'rp-row' },
      React.createElement('div', { className: 'rp-col' }, React.createElement('div', { className: 'rp-label', style: { marginTop: 0 } }, 'Left'), React.createElement(SpinField, { value: '0 "', onUp: () => {}, onDown: () => {} })),
      React.createElement('div', { className: 'rp-col' }, React.createElement('div', { className: 'rp-label', style: { marginTop: 0 } }, 'Right'), React.createElement(SpinField, { value: '0 "', onUp: () => {}, onDown: () => {} }))),
    React.createElement('div', { className: 'rp-label' }, 'Special'),
    React.createElement('div', { className: 'rp-row' },
      React.createElement('div', { className: 'rp-col' }, React.createElement(Field, { value: '(none)' })),
      React.createElement('div', { className: 'rp-col' }, React.createElement(SpinField, { value: '0 "', onUp: () => {}, onDown: () => {} }))),
    React.createElement('div', { className: 'rp-divider' }),
    React.createElement(BgColorRow, { ctx }),
    React.createElement('a', { className: 'rp-link', style: { textAlign: 'center', display: 'block', marginTop: 14 } }, 'Show advanced settings')
  );
}

function SpacingTypeSelect({ ctx }) {
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('div', { ref, className: 'field select', onClick }, React.createElement('span', null, ctx.spacingType)),
    menuWidth: 130,
    menu: (close) => React.createElement('div', null,
      ['Multiple', 'At least', 'Exactly'].map((t) => React.createElement(MenuItem, { key: t, label: t, checked: ctx.spacingType === t, onClick: () => ctx.setSpacingType(t), close }))),
  });
}

function BgColorRow({ ctx }) {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
    React.createElement(Dropdown, {
      render: ({ ref, onClick }) => React.createElement('div', { ref, onClick, style: { display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-control)', borderRadius: 3, cursor: 'pointer', height: 26 } },
        React.createElement('span', { style: { width: 28, height: 24, margin: 1, background: ctx.colors.shade || 'transparent', position: 'relative', display: 'inline-block' } },
          !ctx.colors.shade && React.createElement('span', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(to top right, transparent 46%, #d33 46%, #d33 54%, transparent 54%)' } })),
        React.createElement('span', { style: { width: 16, display: 'inline-flex', justifyContent: 'center' } }, React.createElement(Icon, { n: 'chevdown', size: 12 }))),
      menu: (close) => React.createElement(ColorGrid, { onPick: (c) => { ctx.setShade(c); close(); } }),
    }),
    React.createElement('span', { style: { fontSize: 11 } }, 'Background color')
  );
}

function SimplePanel({ title, rows }) {
  return React.createElement('div', null,
    React.createElement('div', { className: 'rp-section-title' }, title),
    rows.map((r, i) => React.createElement('div', { key: i },
      React.createElement('div', { className: 'rp-label' }, r),
      React.createElement('div', { className: 'field select' }, React.createElement('span', null, '\u2014')))));
}
const TableSettings = () => React.createElement(SimplePanel, { title: 'Table - Advanced Settings', rows: ['Rows & Columns', 'Borders & Background', 'Cell Margins', 'Table Style'] });
const ImageSettings = () => React.createElement(SimplePanel, { title: 'Image Settings', rows: ['Size', 'Wrapping Style', 'Position', 'Rotation'] });
const ShapeSettings = () => React.createElement(SimplePanel, { title: 'Shape Settings', rows: ['Fill', 'Line', 'Weights & Arrows', 'Shadow'] });
const TextSettings = () => React.createElement(SimplePanel, { title: 'Text Art Settings', rows: ['Template', 'Fill', 'Line'] });
const HFSettings = () => React.createElement(SimplePanel, { title: 'Header & Footer', rows: ['Position', 'Different first page', 'Different odd & even', 'Link to previous'] });

Object.assign(window, { LeftRail, LeftPanel, RightRail, RightPanel });
