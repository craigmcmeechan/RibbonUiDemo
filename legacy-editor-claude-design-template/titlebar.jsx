/* global React, Icon, Dropdown, MenuItem, MenuSep */
const { useState: useStateTB } = React;

function LogoMark() {
  return React.createElement('span', { className: 'tb-logo-mark' },
    React.createElement('svg', { viewBox: '0 0 24 24', width: 17, height: 17 },
      React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 5, fill: 'var(--logo-fill)' }),
      React.createElement('circle', { cx: 9, cy: 12, r: 2.4, fill: '#fff' }),
      React.createElement('circle', { cx: 15, cy: 12, r: 2.4, fill: '#fff', opacity: 0.55 })
    )
  );
}

function TitleBar({ docName, onCmd, canUndo, canRedo }) {
  return React.createElement('header', { className: 'titlebar' },
    React.createElement('div', { className: 'tb-logo' },
      React.createElement(LogoMark, null),
      React.createElement('span', null, 'DOCUMENTS')
    ),
    React.createElement('div', { className: 'tb-quick' },
      React.createElement(Dropdown, {
        render: ({ ref, onClick }) => React.createElement('button', { ref, onClick, className: 'tb-btn', title: 'Save' },
          React.createElement(Icon, { n: 'save' })),
        menu: (close) => React.createElement('div', null,
          React.createElement(MenuItem, { icon: 'save', label: 'Save', shortcut: 'Ctrl+S', close }),
          React.createElement(MenuItem, { icon: 'blankpage', label: 'Save copy as\u2026', close }),
          React.createElement(MenuItem, { icon: 'updatefield', label: 'Save as template', close })
        ),
      }),
      React.createElement('button', { className: 'tb-btn', title: 'Print (Ctrl+P)', onClick: () => onCmd('print') },
        React.createElement(Icon, { n: 'print' })),
      React.createElement('button', { className: 'tb-btn', title: 'Quick print', onClick: () => onCmd('print') },
        React.createElement(Icon, { n: 'quickprint' })),
      React.createElement('span', { className: 'tb-sep' }),
      React.createElement('button', { className: 'tb-btn', title: 'Undo (Ctrl+Z)', disabled: !canUndo, onClick: () => onCmd('undo') },
        React.createElement(Icon, { n: 'undo' })),
      React.createElement('button', { className: 'tb-btn', title: 'Redo (Ctrl+Y)', disabled: !canRedo, onClick: () => onCmd('redo') },
        React.createElement(Icon, { n: 'redo' })),
      React.createElement('span', { className: 'tb-sep' }),
      React.createElement(Dropdown, {
        render: ({ ref, onClick }) => React.createElement('button', { ref, onClick, className: 'tb-btn', title: 'Customize quick access' },
          React.createElement(Icon, { n: 'more' })),
        menu: (close) => React.createElement('div', null,
          React.createElement(MenuHeadTB, null, 'Customize Quick Access'),
          React.createElement(MenuItem, { icon: 'save', label: 'Save', checked: true, close }),
          React.createElement(MenuItem, { icon: 'print', label: 'Print', checked: true, close }),
          React.createElement(MenuItem, { icon: 'quickprint', label: 'Quick print', checked: true, close }),
          React.createElement(MenuItem, { icon: 'undo', label: 'Undo', checked: true, close }),
          React.createElement(MenuItem, { icon: 'redo', label: 'Redo', checked: true, close })
        ),
      })
    ),
    React.createElement('div', { className: 'tb-title' }, docName),
    React.createElement('div', { className: 'tb-right' },
      React.createElement(Dropdown, {
        align: 'right',
        render: ({ ref, onClick }) => React.createElement('button', { ref, onClick, className: 'tb-avatar', title: 'Account' }, 'CM'),
        menu: (close) => React.createElement('div', { style: { minWidth: 180 } },
          React.createElement('div', { style: { padding: '8px 12px', borderBottom: '1px solid var(--border-divider)' } },
            React.createElement('div', { style: { fontWeight: 600 } }, 'Craig McMeechan'),
            React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)' } }, 'craig@example.com')),
          React.createElement(MenuItem, { icon: 'user', label: 'View profile', close }),
          React.createElement(MenuItem, { icon: 'settings', label: 'Settings', close }),
          React.createElement(MenuSep, null),
          React.createElement(MenuItem, { label: 'Sign out', close })
        ),
      }),
      React.createElement('button', { className: 'tb-winbtn close', title: 'Close', onClick: () => onCmd('close') },
        React.createElement(Icon, { n: 'close', size: 16 }))
    )
  );
}

function MenuHeadTB({ children }) {
  return React.createElement('div', { className: 'menu-head' }, children);
}

window.TitleBar = TitleBar;
