/* global React, Icon */
const { useState, useRef, useEffect, useLayoutEffect, useCallback } = React;

/* ---------- click-outside + escape ---------- */
function useDismiss(open, close, refs) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      for (const r of refs) { if (r.current && r.current.contains(e.target)) return; }
      close();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);
}

/* ---------- generic dropdown ---------- */
function Dropdown({ children, menu, align = 'left', menuWidth, className, render }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const anchorRef = useRef(null);
  const popRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, [anchorRef, popRef]);

  const openMenu = () => {
    const r = anchorRef.current.getBoundingClientRect();
    let left = align === 'right' ? r.right : r.left;
    const top = r.bottom + 1;
    setPos({ left, top, anchorRight: r.right });
    setOpen((o) => !o);
  };

  useLayoutEffect(() => {
    if (open && popRef.current) {
      const pr = popRef.current.getBoundingClientRect();
      let left = pos.left;
      if (align === 'right') left = pos.anchorRight - pr.width;
      if (left + pr.width > window.innerWidth - 6) left = window.innerWidth - pr.width - 6;
      if (left < 6) left = 6;
      let top = pos.top;
      if (top + pr.height > window.innerHeight - 6) top = Math.max(6, window.innerHeight - pr.height - 6);
      if (left !== pos.left || top !== pos.top) setPos((p) => ({ ...p, left, top }));
    }
  }, [open]);

  return React.createElement(React.Fragment, null,
    render
      ? render({ ref: anchorRef, onClick: openMenu, open })
      : React.createElement('div', { ref: anchorRef, onClick: openMenu, className, style: { display: 'inline-flex' } }, children),
    open && React.createElement('div', {
      ref: popRef, className: 'popover',
      style: { left: pos.left, top: pos.top, minWidth: menuWidth },
    }, typeof menu === 'function' ? menu(close) : menu)
  );
}

/* ---------- menu items ---------- */
function MenuItem({ icon, label, shortcut, checked, onClick, close, children }) {
  return React.createElement('div', {
    className: 'menu-item' + (checked ? ' checked' : ''),
    onClick: () => { if (onClick) onClick(); if (close) close(); },
  },
    icon !== undefined && React.createElement('span', { className: 'mi-ic' },
      checked ? React.createElement(Icon, { n: 'check' }) : (icon ? React.createElement(Icon, { n: icon }) : null)),
    React.createElement('span', { className: 'mi-label' }, label),
    shortcut && React.createElement('span', { className: 'mi-short' }, shortcut),
    children
  );
}
const MenuSep = () => React.createElement('div', { className: 'menu-sep' });
const MenuHead = ({ children }) => React.createElement('div', { className: 'menu-head' }, children);

/* ---------- ribbon group ---------- */
function Group({ label, children }) {
  return React.createElement('div', { className: 'ribbon-group' },
    React.createElement('div', { className: 'rg-body' }, children),
    React.createElement('div', { className: 'rg-label' }, label)
  );
}
const Rows = ({ children }) => React.createElement('div', { className: 'rib-rows' }, children);
const Row = ({ children }) => React.createElement('div', { className: 'rib-row' }, children);

/* ---------- buttons ---------- */
function BigButton({ n, label, caret, checked, onClick, glyph }) {
  return React.createElement('button', {
    className: 'rib-big' + (checked ? ' checked' : ''), onClick, title: Array.isArray(label) ? label.join(' ') : label,
  },
    React.createElement('span', { className: 'ic' }, glyph || React.createElement(Icon, { n })),
    React.createElement('span', { className: 'cap' + (caret ? ' caret' : '') },
      Array.isArray(label)
        ? label.map((l, i) => React.createElement('span', { key: i, style: { display: 'block' } }, l))
        : label)
  );
}

function SmallButton({ n, checked, disabled, onClick, title, glyph }) {
  return React.createElement('button', {
    className: 'rib-sm' + (checked ? ' checked' : '') + (disabled ? ' disabled' : ''),
    onClick, title,
  }, glyph || React.createElement(Icon, { n }));
}

/* small button + caret combined (e.g. font color) */
function SmallCaret({ n, glyph, checked, title, onMain, onCaret }) {
  return React.createElement('span', { className: 'rib-sm-caret' + (checked ? ' checked' : ''), title },
    React.createElement('span', { className: 'ic', onClick: onMain }, glyph || React.createElement(Icon, { n })),
    React.createElement('span', { className: 'cv', onClick: onCaret })
  );
}

/* text-glyph format buttons: B I U S etc */
function FmtButton({ glyph, fontStyle, checked, onClick, title }) {
  return React.createElement('button', {
    className: 'rib-sm' + (checked ? ' checked' : ''), onClick, title,
    style: { fontFamily: 'Georgia, serif', fontSize: 15, color: 'var(--icon-color-strong)' },
  }, React.createElement('span', { style: fontStyle }, glyph));
}

/* font color / highlight composite */
function ColorButton({ n, color, title, onApply, palette }) {
  return React.createElement(Dropdown, {
    align: 'left',
    render: ({ ref, onClick }) =>
      React.createElement('span', { ref, className: 'rib-sm-caret', title },
        React.createElement('span', {
          className: 'ic',
          onClick: () => onApply(color),
          style: { flexDirection: 'column', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        },
          React.createElement(Icon, { n, style: { width: 18, height: 18 } }),
          React.createElement('span', { style: { width: 16, height: 3, background: color, borderRadius: 1, marginTop: -1 } })
        ),
        React.createElement('span', { className: 'cv', onClick })
      ),
    menu: (close) => React.createElement(ColorGrid, { onPick: (c) => { onApply(c); close(); } }),
  });
}

const SAFE_PALETTE = [
  '#000000', '#404040', '#5a5a5a', '#7f7f7f', '#a6a6a6', '#d9d9d9', '#f2f2f2', '#ffffff', '#c00000', '#ff0000',
  '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0', '#e84393', '#ff7a59',
  '#4472c4', '#5b9bd5', '#70ad47', '#264478', '#9e480e', '#843c0c', '#548235', '#1f4e79', '#7f6000', '#3a3a3a',
];
function ColorGrid({ onPick }) {
  return React.createElement('div', null,
    React.createElement('div', { className: 'color-grid' },
      SAFE_PALETTE.map((c, i) => React.createElement('div', {
        key: i, className: 'color-cell', style: { background: c }, onClick: () => onPick(c), title: c,
      }))
    ),
    React.createElement('div', { className: 'menu-sep' }),
    React.createElement('div', { className: 'menu-item', onClick: () => onPick('') },
      React.createElement('span', { className: 'mi-ic' }), 'No fill / Automatic')
  );
}

/* combobox (font name, size) */
function Combo({ value, width, items, onPick, editable }) {
  return React.createElement(Dropdown, {
    menuWidth: Math.max(width, 130),
    render: ({ ref, onClick }) =>
      React.createElement('span', { ref, className: 'rib-combo', style: { width }, onClick },
        React.createElement('span', { className: 'cv' }, value),
        React.createElement('span', { className: 'cb' })
      ),
    menu: (close) => React.createElement('div', { style: { maxHeight: 300, overflowY: 'auto' } },
      items.map((it) => React.createElement('div', {
        key: it, className: 'menu-item' + (it === value ? ' checked' : ''),
        style: it.length > 3 ? { fontFamily: it } : null,
        onClick: () => { onPick(it); close(); },
      }, React.createElement('span', { className: 'mi-label' }, it)))
    ),
  });
}

/* spinner used in ribbon for font size */
function MiniStepper({ onUp, onDown }) {
  return React.createElement('span', { className: 'rib-spin' },
    React.createElement('button', { onClick: onUp }, '\u25B2'),
    React.createElement('button', { onClick: onDown }, '\u25BC')
  );
}

/* checkbox for panels and view toggles */
function Check({ on, label, onClick }) {
  return React.createElement('label', { className: 'rp-check', onClick },
    React.createElement('span', { className: 'checkbox' + (on ? ' on' : '') }, on && React.createElement(Icon, { n: 'check' })),
    React.createElement('span', null, label)
  );
}

/* ribbon-level labeled checkbox (View tab) */
function RibbonCheck({ on, label, onClick }) {
  return React.createElement('label', {
    onClick, title: label,
    style: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', padding: '2px 4px', borderRadius: 3, color: 'var(--text-normal)', whiteSpace: 'nowrap' },
  },
    React.createElement('span', { className: 'checkbox' + (on ? ' on' : '') }, on && React.createElement(Icon, { n: 'check' })),
    label
  );
}

Object.assign(window, {
  Dropdown, MenuItem, MenuSep, MenuHead, Group, Rows, Row,
  BigButton, SmallButton, SmallCaret, FmtButton, ColorButton, ColorGrid,
  Combo, MiniStepper, Check, RibbonCheck, useDismiss, SAFE_PALETTE,
});
