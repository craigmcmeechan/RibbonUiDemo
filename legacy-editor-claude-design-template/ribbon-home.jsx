/* global React, Icon, Group, Rows, Row, BigButton, SmallButton, FmtButton, ColorButton,
   Combo, MiniStepper, RibbonCheck, Dropdown, MenuItem, MenuSep, MenuHead */

const FONTS = ['Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier New',
  'Georgia', 'Helvetica', 'Impact', 'Lato', 'Open Sans', 'Roboto', 'Tahoma',
  'Times New Roman', 'Trebuchet MS', 'Verdana'];
const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48', '72'];
const STYLES = [
  { name: 'Normal', lines: [3, 3, 2], color: '#3a3a3a', fs: 11 },
  { name: 'No Spacing', lines: [3, 3, 3], color: '#3a3a3a', fs: 11 },
  { name: 'Heading 1', lines: [4], color: '#2a4d7a', fs: 13, bold: true },
  { name: 'Heading 2', lines: [3], color: '#2f5c91', fs: 12, bold: true },
  { name: 'Heading 3', lines: [3], color: '#3f6ca5', fs: 11, bold: true },
  { name: 'Title', lines: [5], color: '#222', fs: 14, bold: true },
  { name: 'Subtitle', lines: [3], color: '#888', fs: 11 },
];

/* ===================== HOME ===================== */
function HomeTab({ ctx }) {
  const f = ctx.fmt;
  return React.createElement(React.Fragment, null,
    // Clipboard
    React.createElement(Group, { label: 'Clipboard' },
      React.createElement(Rows, null,
        React.createElement(Row, null,
          React.createElement(SmallButton, { n: 'copy', title: 'Copy (Ctrl+C)', onClick: () => ctx.exec('copy') }),
          React.createElement(SmallButton, { n: 'cut', title: 'Cut (Ctrl+X)', onClick: () => ctx.exec('cut') })),
        React.createElement(Row, null,
          React.createElement(SmallButton, { n: 'paste', title: 'Paste (Ctrl+V)', onClick: () => ctx.exec('paste') }),
          React.createElement(SmallButton, { n: 'painter', title: 'Copy style', checked: ctx.painter, onClick: ctx.togglePainter }))
      )
    ),
    // Font
    React.createElement(Group, { label: 'Font' },
      React.createElement(Rows, null,
        React.createElement(Row, null,
          React.createElement(Combo, { value: ctx.font.name, width: 118, items: FONTS, onPick: ctx.applyFont }),
          React.createElement('span', { className: 'rib-combo', style: { width: 50 } },
            React.createElement('span', { className: 'cv', style: { padding: '0 4px' } }, ctx.font.size),
            React.createElement(MiniStepper, { onUp: () => ctx.bumpSize(1), onDown: () => ctx.bumpSize(-1) })),
          React.createElement(SmallButton, { n: 'growfont', title: 'Increment font size', onClick: () => ctx.bumpSize(1) }),
          React.createElement(SmallButton, { n: 'shrinkfont', title: 'Decrement font size', onClick: () => ctx.bumpSize(-1) })
        ),
        React.createElement(Row, null,
          React.createElement(FmtButton, { glyph: 'B', fontStyle: { fontWeight: 700 }, checked: f.bold, title: 'Bold (Ctrl+B)', onClick: () => ctx.exec('bold') }),
          React.createElement(FmtButton, { glyph: 'I', fontStyle: { fontStyle: 'italic' }, checked: f.italic, title: 'Italic (Ctrl+I)', onClick: () => ctx.exec('italic') }),
          React.createElement(FmtButton, { glyph: 'U', fontStyle: { textDecoration: 'underline' }, checked: f.underline, title: 'Underline (Ctrl+U)', onClick: () => ctx.exec('underline') }),
          React.createElement(FmtButton, { glyph: 'S', fontStyle: { textDecoration: 'line-through' }, checked: f.strike, title: 'Strikethrough', onClick: () => ctx.exec('strikeThrough') }),
          React.createElement(FmtButton, { glyph: 'x\u00B2', fontStyle: { fontSize: 12 }, checked: f.sup, title: 'Superscript', onClick: () => ctx.exec('superscript') }),
          React.createElement(FmtButton, { glyph: 'x\u2082', fontStyle: { fontSize: 12 }, checked: f.sub, title: 'Subscript', onClick: () => ctx.exec('subscript') }),
          React.createElement(ColorButton, { n: 'highlight', color: ctx.colors.hilite, title: 'Highlight color', onApply: (c) => ctx.applyColor('hiliteColor', c, 'hilite') }),
          React.createElement(ColorButton, { n: 'fontcolor', color: ctx.colors.fore, title: 'Font color', onApply: (c) => ctx.applyColor('foreColor', c, 'fore') }),
          React.createElement(SmallButton, { n: 'clearstyle', title: 'Clear style', onClick: () => ctx.exec('removeFormat') })
        )
      )
    ),
    // Paragraph
    React.createElement(Group, { label: 'Paragraph' },
      React.createElement(Rows, null,
        React.createElement(Row, null,
          React.createElement(SmallButton, { n: 'bullets', title: 'Bullets', onClick: () => ctx.exec('insertUnorderedList') }),
          React.createElement(SmallButton, { n: 'numbering', title: 'Numbering', onClick: () => ctx.exec('insertOrderedList') }),
          React.createElement(SmallButton, { n: 'multilevel', title: 'Multilevel list' }),
          React.createElement('span', { style: { width: 4 } }),
          React.createElement(SmallButton, { n: 'indentdec', title: 'Decrease indent', onClick: () => ctx.exec('outdent') }),
          React.createElement(SmallButton, { n: 'indentinc', title: 'Increase indent', onClick: () => ctx.exec('indent') }),
          React.createElement(SmallButton, { n: 'marks', title: 'Nonprinting characters', checked: ctx.marks, onClick: ctx.toggleMarks })
        ),
        React.createElement(Row, null,
          React.createElement(SmallButton, { n: 'alignleft', title: 'Align left (Ctrl+L)', checked: f.align === 'left', onClick: () => ctx.exec('justifyLeft') }),
          React.createElement(SmallButton, { n: 'aligncenter', title: 'Align center (Ctrl+E)', checked: f.align === 'center', onClick: () => ctx.exec('justifyCenter') }),
          React.createElement(SmallButton, { n: 'alignright', title: 'Align right (Ctrl+R)', checked: f.align === 'right', onClick: () => ctx.exec('justifyRight') }),
          React.createElement(SmallButton, { n: 'alignjustify', title: 'Justified (Ctrl+J)', checked: f.align === 'justify', onClick: () => ctx.exec('justifyFull') }),
          React.createElement('span', { style: { width: 4 } }),
          React.createElement(LineSpacingBtn, { ctx }),
          React.createElement(ColorButton, { n: 'shading', color: ctx.colors.shade, title: 'Shading color', onApply: (c) => ctx.applyColor('hiliteColor', c, 'shade') })
        )
      )
    ),
    // Styles
    React.createElement(Group, { label: 'Styles' },
      React.createElement('div', { className: 'style-gallery' },
        STYLES.map((s) => React.createElement('div', {
          key: s.name, className: 'style-chip' + (ctx.curStyle === s.name ? ' active' : ''),
          onClick: () => ctx.applyStyle(s.name), title: s.name,
        },
          React.createElement('span', { className: 'sc-name', style: { color: s.color, fontWeight: s.bold ? 700 : 400, fontSize: s.fs - 2 } },
            s.name.replace('Heading ', 'H')),
          React.createElement('span', { className: 'sc-lines' }, s.lines.map((w, i) =>
            React.createElement('i', { key: i, style: { width: w * 18 + '%', background: s.color, opacity: 0.4 } })))
        ))
      )
    ),
    // Editing
    React.createElement(Group, { label: 'Editing' },
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement('button', {
          className: 'rib-big', style: { minWidth: 64, flexDirection: 'row', gap: 6, height: 'auto', padding: '4px 8px' },
          onClick: () => ctx.openLeftPanel('search'),
        }, React.createElement('span', { className: 'ic', style: { width: 20, height: 20 } }, React.createElement(Icon, { n: 'search', size: 18 })),
          React.createElement('span', null, 'Replace'))),
        React.createElement(Row, null, React.createElement('button', {
          className: 'rib-big', style: { minWidth: 64, flexDirection: 'row', gap: 6, height: 'auto', padding: '4px 8px' },
          onClick: () => ctx.exec('selectAll'),
        }, React.createElement('span', { className: 'ic', style: { width: 20, height: 20 } }, React.createElement(Icon, { n: 'selectcur', size: 18 })),
          React.createElement('span', null, 'Select')))
      )
    )
  );
}

function LineSpacingBtn({ ctx }) {
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('span', { ref, className: 'rib-sm', title: 'Line spacing', onClick },
      React.createElement(Icon, { n: 'linespacing' })),
    menu: (close) => React.createElement('div', null,
      ['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map((v) =>
        React.createElement(MenuItem, { key: v, label: v, checked: ctx.lineSpacing === v, onClick: () => ctx.setLineSpacing(v), close })),
      React.createElement(MenuSep, null),
      React.createElement(MenuItem, { label: 'Line spacing options\u2026', onClick: () => ctx.openRightPanel(0), close })
    ),
  });
}

/* ===================== INSERT ===================== */
function InsertTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Pages' },
      React.createElement(BigButton, { n: 'blankpage', label: ['Blank', 'Page'], onClick: () => ctx.insert('page') }),
      React.createElement(BigButton, { n: 'pagebreak', label: ['Page', 'Break'], onClick: () => ctx.insert('pagebreak') })
    ),
    React.createElement(Group, { label: 'Tables' },
      React.createElement(TableButton, { ctx })
    ),
    React.createElement(Group, { label: 'Illustrations' },
      React.createElement(BigButton, { n: 'image', label: 'Image', caret: true, onClick: () => ctx.insert('image') }),
      React.createElement(BigButton, { n: 'shapes', label: 'Shapes', caret: true }),
      React.createElement(BigButton, { n: 'iconsins', label: 'Icons', caret: true }),
      React.createElement(BigButton, { n: 'chart', label: 'Chart', caret: true }),
      React.createElement(BigButton, { n: 'smartart', label: 'SmartArt', caret: true })
    ),
    React.createElement(Group, { label: 'Header & Footer' },
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'header', label: 'Header' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'footer', label: 'Footer' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'pagenum', label: 'Page Number' }))
      )
    ),
    React.createElement(Group, { label: 'Text' },
      React.createElement(BigButton, { n: 'textbox', label: ['Text', 'Box'], caret: true, onClick: () => ctx.insert('textbox') }),
      React.createElement(BigButton, { n: 'textart', label: ['Text', 'Art'], caret: true }),
      React.createElement(BigButton, { n: 'dropcap', label: ['Drop', 'Cap'], caret: true })
    ),
    React.createElement(Group, { label: 'Links' },
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'hyperlink', label: 'Hyperlink', onClick: () => ctx.insert('link') })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'bookmark', label: 'Bookmark' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'crossref', label: 'Cross-reference' }))
      )
    ),
    React.createElement(Group, { label: 'Symbols' },
      React.createElement(BigButton, { n: 'equation', label: 'Equation', caret: true }),
      React.createElement(BigButton, { n: 'symbol', label: 'Symbol', caret: true, onClick: () => ctx.insert('symbol') }),
      React.createElement(BigButton, { n: 'comment', label: 'Comment', onClick: () => ctx.openLeftPanel('comments') })
    )
  );
}

function LabeledSmall({ n, label, onClick }) {
  return React.createElement('button', {
    className: 'rib-big', style: { flexDirection: 'row', gap: 7, height: 'auto', padding: '3px 7px', minWidth: 0, justifyContent: 'flex-start', width: '100%' },
    onClick, title: label,
  },
    React.createElement('span', { className: 'ic', style: { width: 18, height: 18 } }, React.createElement(Icon, { n, size: 17 })),
    React.createElement('span', { style: { whiteSpace: 'nowrap' } }, label)
  );
}

function TableButton({ ctx }) {
  const [hover, setHover] = React.useState({ r: 0, c: 0 });
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('span', { ref, onClick, style: { display: 'inline-flex' } },
      React.createElement(BigButton, { n: 'table', label: 'Table', caret: true })),
    menu: (close) => React.createElement('div', { style: { padding: 8 } },
      React.createElement('div', { style: { fontSize: 11, marginBottom: 6, color: 'var(--text-secondary)' } },
        hover.r ? `${hover.r} \u00D7 ${hover.c} Table` : 'Insert Table'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(10, 16px)', gap: 2 } },
        Array.from({ length: 80 }).map((_, i) => {
          const r = Math.floor(i / 10) + 1, c = (i % 10) + 1;
          const on = r <= hover.r && c <= hover.c;
          return React.createElement('div', {
            key: i,
            onMouseEnter: () => setHover({ r, c }),
            onClick: () => { ctx.insert('table', { r, c }); close(); },
            style: { width: 16, height: 16, border: '1px solid var(--border-control)', background: on ? 'var(--accent)' : 'var(--input-bg)', cursor: 'pointer' },
          });
        })),
      React.createElement('div', { className: 'menu-sep' }),
      React.createElement(MenuItem, { icon: 'table', label: 'Insert custom table\u2026', close })
    ),
  });
}

/* ===================== LAYOUT ===================== */
function LayoutTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Page Setup' },
      React.createElement(BigButton, { n: 'margins', label: 'Margins', caret: true }),
      React.createElement(BigButton, { n: 'orientation', label: 'Orientation', caret: true }),
      React.createElement(BigButton, { n: 'size', label: 'Size', caret: true }),
      React.createElement(BigButton, { n: 'columns', label: 'Columns', caret: true }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'breaks', label: 'Breaks' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'linenumbers', label: 'Line Numbers' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'hyphenation', label: 'Hyphenation' }))
      )
    ),
    React.createElement(Group, { label: 'Paragraph' },
      React.createElement(Rows, null,
        React.createElement(Row, null,
          React.createElement('span', { style: { fontSize: 11, width: 78, color: 'var(--text-secondary)' } }, 'Indent Left'),
          React.createElement(SpinSmall, null)),
        React.createElement(Row, null,
          React.createElement('span', { style: { fontSize: 11, width: 78, color: 'var(--text-secondary)' } }, 'Indent Right'),
          React.createElement(SpinSmall, null)),
        React.createElement(Row, null,
          React.createElement('span', { style: { fontSize: 11, width: 78, color: 'var(--text-secondary)' } }, 'Spacing'),
          React.createElement(SpinSmall, null))
      )
    ),
    React.createElement(Group, { label: 'Arrange' },
      React.createElement(BigButton, { n: 'wrap', label: ['Wrapping', 'Style'], caret: true }),
      React.createElement(BigButton, { n: 'alignobj', label: 'Align', caret: true }),
      React.createElement(BigButton, { n: 'group', label: 'Group', caret: true }),
      React.createElement(BigButton, { n: 'position', label: 'Position', caret: true }),
      React.createElement(BigButton, { n: 'rotate', label: 'Rotate', caret: true })
    ),
    React.createElement(Group, { label: 'Page Background' },
      React.createElement(BigButton, { n: 'watermark', label: 'Watermark', caret: true }),
      React.createElement(BigButton, { n: 'shading', label: ['Page', 'Color'], caret: true })
    )
  );
}

function SpinSmall() {
  return React.createElement('span', { className: 'rib-combo', style: { width: 60 } },
    React.createElement('span', { className: 'cv', style: { padding: '0 5px' } }, '0"'),
    React.createElement(MiniStepper, { onUp: () => {}, onDown: () => {} }));
}

/* ===================== VIEW ===================== */
function ViewTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Navigation' },
      React.createElement(BigButton, { n: 'headings', label: 'Headings', checked: ctx.panels.navigation === 'open', onClick: () => ctx.openLeftPanel('navigation') })
    ),
    React.createElement(Group, { label: 'Zoom' },
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(ZoomCombo, { ctx })),
        React.createElement(Row, null,
          React.createElement(LabeledSmall, { n: 'fitpage', label: 'Fit To Page', onClick: () => ctx.setFit('page') }))
      ),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'zoom100', label: 'Zoom to 100%', onClick: () => ctx.setZoom(100) })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'fitwidth', label: 'Fit To Width', onClick: () => ctx.setFit('width') }))
      ),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'multipage', label: 'Multiple Pages' }))
      )
    ),
    React.createElement(Group, { label: 'Appearance' },
      React.createElement(ThemeButton, { ctx }),
      React.createElement(BigButton, { n: 'darkdoc', label: ['Dark', 'Document'], checked: ctx.darkDoc, onClick: ctx.toggleDarkDoc })
    ),
    React.createElement(Group, { label: 'Show' },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'auto auto', gridAutoRows: 'min-content', columnGap: 16, rowGap: 5, alignContent: 'center', height: '100%' } },
        React.createElement(RibbonCheck, { on: ctx.show.toolbar, label: 'Always Show Toolbar', onClick: () => ctx.toggleShow('toolbar') }),
        React.createElement(RibbonCheck, { on: ctx.show.leftPanel, label: 'Left Panel', onClick: () => ctx.toggleShow('leftPanel') }),
        React.createElement(RibbonCheck, { on: ctx.show.rulers, label: 'Rulers', onClick: () => ctx.toggleShow('rulers') }),
        React.createElement(RibbonCheck, { on: ctx.show.statusBar, label: 'Status Bar', onClick: () => ctx.toggleShow('statusBar') }),
        React.createElement(RibbonCheck, { on: ctx.show.rightPanel, label: 'Right Panel', onClick: () => ctx.toggleShow('rightPanel') })
      )
    ),
    React.createElement(Group, { label: 'Macros' },
      React.createElement(BigButton, { n: 'macros', label: 'Macros', caret: true }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'record', label: 'Record macro' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'pause', label: 'Pause recording' }))
      )
    )
  );
}

function ZoomCombo({ ctx }) {
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('span', { ref, className: 'rib-combo', style: { width: 74 }, onClick },
      React.createElement('span', { className: 'cv' }, ctx.zoom + '%'),
      React.createElement('span', { className: 'cb' })),
    menu: (close) => React.createElement('div', null,
      [50, 75, 100, 125, 150, 175, 200].map((z) =>
        React.createElement(MenuItem, { key: z, label: z + '%', checked: ctx.zoom === z, onClick: () => ctx.setZoom(z), close }))),
  });
}

function ThemeButton({ ctx }) {
  const labels = { 'modern-light': 'Light', 'modern-dark': 'Dark', 'classic-light': 'Classic Light' };
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('span', { ref, onClick, style: { display: 'inline-flex' } },
      React.createElement(BigButton, { n: 'theme', label: ['Interface', 'Theme'], caret: true })),
    menu: (close) => React.createElement('div', { style: { minWidth: 170 } },
      React.createElement(MenuHead, null, 'Interface Theme'),
      React.createElement(MenuItem, { label: 'Light', checked: ctx.theme === 'modern-light', onClick: () => ctx.setTheme('modern-light'), close }),
      React.createElement(MenuItem, { label: 'Classic Light', checked: ctx.theme === 'classic-light', onClick: () => ctx.setTheme('classic-light'), close }),
      React.createElement(MenuItem, { label: 'Dark', checked: ctx.theme === 'modern-dark', onClick: () => ctx.setTheme('modern-dark'), close }),
      React.createElement(MenuSep, null),
      React.createElement(MenuItem, { label: 'Same as system', close })
    ),
  });
}

Object.assign(window, { HomeTab, InsertTab, LayoutTab, ViewTab, LabeledSmall, FONTS, SIZES });
