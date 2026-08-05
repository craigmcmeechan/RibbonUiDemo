/* global React, Icon, Group, Rows, Row, BigButton, SmallButton, LabeledSmall,
   ColorButton, Dropdown, MenuItem, MenuSep, MenuHead, RibbonCheck, SAFE_PALETTE */

/* ===================== DRAW ===================== */
function DrawTab({ ctx }) {
  const tool = ctx.drawTool;
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Tools' },
      React.createElement(BigButton, { n: 'selectcur', label: 'Select', checked: tool === 'select', onClick: () => ctx.setDrawTool('select') }),
      React.createElement(BigButton, { n: 'pen', label: 'Draw', caret: true, checked: tool === 'pen', onClick: () => ctx.setDrawTool('pen') }),
      React.createElement(BigButton, { n: 'highlighterpen', label: 'Highlighter', caret: true, checked: tool === 'hi', onClick: () => ctx.setDrawTool('hi') }),
      React.createElement(BigButton, { n: 'eraser', label: 'Eraser', checked: tool === 'eraser', onClick: () => ctx.setDrawTool('eraser') })
    ),
    React.createElement(Group, { label: 'Pen Color' },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(8, 18px)', gridTemplateRows: 'repeat(2, 18px)', gap: 3, alignContent: 'center', height: '100%' } },
        SAFE_PALETTE.slice(0, 16).map((c, i) => React.createElement('div', {
          key: i, onClick: () => ctx.setDrawColor(c),
          style: { width: 18, height: 18, borderRadius: 3, background: c, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.15)', outline: ctx.drawColor === c ? '2px solid var(--accent)' : 'none' },
        })))
    ),
    React.createElement(Group, { label: 'Thickness' },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center', height: '100%', width: 130 } },
        [1, 2, 4, 6].map((w) => React.createElement('div', {
          key: w, onClick: () => ctx.setDrawWidth(w),
          style: { height: w + 2, background: ctx.drawWidth === w ? 'var(--accent)' : 'var(--icon-color)', borderRadius: 4, cursor: 'pointer' },
        })))
    )
  );
}

/* ===================== REFERENCES ===================== */
function ReferencesTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Table of Contents' },
      React.createElement(BigButton, { n: 'toc', label: ['Table of', 'Contents'], caret: true }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'updatefield', label: 'Refresh' })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'settings', label: 'Settings' }))
      )
    ),
    React.createElement(Group, { label: 'Footnotes' },
      React.createElement(BigButton, { n: 'footnote', label: ['Insert', 'Footnote'], caret: true }),
      React.createElement(BigButton, { n: 'endnote', label: ['Insert', 'Endnote'] })
    ),
    React.createElement(Group, { label: 'Citations' },
      React.createElement(BigButton, { n: 'citation', label: ['Insert', 'Citation'], caret: true }),
      React.createElement(BigButton, { n: 'bibliography', label: 'Bibliography', caret: true })
    ),
    React.createElement(Group, { label: 'Captions' },
      React.createElement(BigButton, { n: 'caption', label: ['Insert', 'Caption'] }),
      React.createElement(BigButton, { n: 'toc', label: ['Table of', 'Figures'], caret: true })
    ),
    React.createElement(Group, { label: 'Links' },
      React.createElement(BigButton, { n: 'crossref', label: ['Cross-', 'reference'] }),
      React.createElement(BigButton, { n: 'bookmark', label: 'Bookmark' })
    )
  );
}

/* ===================== COLLABORATION ===================== */
function CollaborationTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Sharing' },
      React.createElement(BigButton, { n: 'share', label: ['Sharing', 'Settings'], onClick: ctx.openShare })
    ),
    React.createElement(Group, { label: 'Co-editing' },
      React.createElement(BigButton, { n: 'coediting', label: ['Co-editing', 'Mode'], caret: true }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'comment', label: 'Comment', onClick: () => ctx.openLeftPanel('comments') })),
        React.createElement(Row, null, React.createElement(LabeledSmall, { n: 'chat', label: 'Chat', onClick: () => ctx.openLeftPanel('chat') }))
      )
    ),
    React.createElement(Group, { label: 'Track Changes' },
      React.createElement(BigButton, { n: 'trackchanges', label: ['Track', 'Changes'], checked: ctx.track, onClick: ctx.toggleTrack }),
      React.createElement(DisplayModeBtn, { ctx }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(SmallButton, { n: 'accept', title: 'Accept' }), React.createElement(SmallButton, { n: 'reject', title: 'Reject' })),
        React.createElement(Row, null, React.createElement(SmallButton, { n: 'prevchange', title: 'Previous' }), React.createElement(SmallButton, { n: 'nextchange', title: 'Next' }))
      )
    ),
    React.createElement(Group, { label: 'Compare' },
      React.createElement(BigButton, { n: 'compare', label: 'Compare', caret: true })
    )
  );
}

function DisplayModeBtn({ ctx }) {
  return React.createElement(Dropdown, {
    render: ({ ref, onClick }) => React.createElement('span', { ref, onClick, style: { display: 'inline-flex' } },
      React.createElement(BigButton, { n: 'trackchanges', label: ['Display', 'Mode'], caret: true })),
    menu: (close) => React.createElement('div', { style: { minWidth: 180 } },
      React.createElement(MenuHead, null, 'Display Mode'),
      ['Markup and balloons', 'Only markup', 'Final', 'Original'].map((m, i) =>
        React.createElement(MenuItem, { key: m, label: m, checked: ctx.displayMode === i, onClick: () => ctx.setDisplayMode(i), close }))
    ),
  });
}

/* ===================== PROTECTION ===================== */
function ProtectionTab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Protect' },
      React.createElement(BigButton, { n: 'protect', label: ['Protect', 'Document'], caret: true, checked: ctx.protect, onClick: ctx.toggleProtect }),
      React.createElement(BigButton, { n: 'encrypt', label: 'Encrypt', caret: true })
    ),
    React.createElement(Group, { label: 'Signatures' },
      React.createElement(BigButton, { n: 'signature', label: ['Add', 'Signature'], caret: true }),
      React.createElement(BigButton, { n: 'signline', label: ['Signature', 'Line'] })
    ),
    React.createElement(Group, { label: 'Permissions' },
      React.createElement(BigButton, { n: 'permissions', label: ['Access', 'Rights'], onClick: ctx.openShare }),
      React.createElement(Rows, null,
        React.createElement(Row, null, React.createElement(RibbonCheck, { on: ctx.readOnly, label: 'Read-only', onClick: ctx.toggleReadOnly })),
        React.createElement(Row, null, React.createElement(RibbonCheck, { on: false, label: 'Mark as final' }))
      )
    )
  );
}

/* ===================== PLUGINS ===================== */
function PluginsTab({ ctx }) {
  const plugins = [
    { n: 'translate', label: 'Translator' },
    { n: 'speech', label: ['Speech', 'to Text'] },
    { n: 'code', label: ['Highlight', 'Code'] },
    { n: 'imagegen', label: ['Photo', 'Editor'] },
    { n: 'symbol', label: 'Thesaurus' },
  ];
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Background Plugins' },
      React.createElement(BigButton, { n: 'plugin', label: ['Plugin', 'Manager'], onClick: ctx.openPlugins }),
      React.createElement(BigButton, { n: 'settings', label: 'Settings' })
    ),
    React.createElement(Group, { label: 'Installed' },
      plugins.map((p) => React.createElement(BigButton, { key: p.label.toString(), n: p.n, label: p.label }))
    )
  );
}

/* ===================== AI ===================== */
function AITab({ ctx }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Group, { label: 'Assistant' },
      React.createElement(BigButton, { n: 'ai', label: ['AI', 'Assistant'], onClick: () => ctx.openLeftPanel('chat') }),
      React.createElement(BigButton, { n: 'chat', label: 'Chat', onClick: () => ctx.openLeftPanel('chat') })
    ),
    React.createElement(Group, { label: 'Text' },
      React.createElement(BigButton, { n: 'summarize', label: 'Summarize' }),
      React.createElement(BigButton, { n: 'rewrite', label: 'Rewrite', caret: true }),
      React.createElement(BigButton, { n: 'translate', label: 'Translate', caret: true }),
      React.createElement(BigButton, { n: 'thesaurus', label: ['Spelling &', 'Grammar'] })
    ),
    React.createElement(Group, { label: 'Generate' },
      React.createElement(BigButton, { n: 'imagegen', label: ['Generate', 'Image'] }),
      React.createElement(BigButton, { n: 'summarize', label: ['Generate', 'Text'] })
    ),
    React.createElement(Group, { label: 'Configuration' },
      React.createElement(BigButton, { n: 'settings', label: ['AI', 'Settings'], caret: true })
    )
  );
}

Object.assign(window, { DrawTab, ReferencesTab, CollaborationTab, ProtectionTab, PluginsTab, AITab });
