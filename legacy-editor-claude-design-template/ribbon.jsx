/* global React, Icon, Dropdown, MenuItem, MenuSep, MenuHead,
   HomeTab, InsertTab, LayoutTab, ViewTab, DrawTab, ReferencesTab,
   CollaborationTab, ProtectionTab, PluginsTab, AITab */

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Layout', 'References', 'Collaboration', 'Protection', 'View', 'Plugins', 'AI'];

function Ribbon({ ctx }) {
  const active = ctx.activeTab;
  const panels = {
    Home: HomeTab, Insert: InsertTab, Draw: DrawTab, Layout: LayoutTab,
    References: ReferencesTab, Collaboration: CollaborationTab, Protection: ProtectionTab,
    View: ViewTab, Plugins: PluginsTab, AI: AITab,
  };
  const Panel = panels[active] || HomeTab;
  const collapsed = !ctx.show.toolbar && !ctx.toolbarPinned;

  return React.createElement('div', { className: 'ribbon' },
    React.createElement('div', { className: 'ribbon-tabs' },
      React.createElement('div', { className: 'tabs-scroll' },
        TABS.map((t) => t === 'File'
          ? React.createElement('button', {
              key: t, className: 'ribbon-tab filetab',
              onClick: () => ctx.openBackstage(),
            }, t)
          : React.createElement('button', {
              key: t, className: 'ribbon-tab' + (active === t ? ' active' : ''),
              onClick: () => ctx.setActiveTab(t),
            }, t))
      ),
      React.createElement('div', { className: 'ribbon-tabs-right' },
        React.createElement(Dropdown, {
          align: 'right',
          render: ({ ref, onClick }) => React.createElement('button', { ref, onClick, className: 'tabs-action' },
            React.createElement(Icon, { n: ctx.editMode === 'Editing' ? 'pen' : (ctx.editMode === 'Reviewing' ? 'trackchanges' : 'about'), size: 14 }),
            ctx.editMode, React.createElement(Icon, { n: 'chevdown', size: 12 })),
          menu: (close) => React.createElement('div', { style: { minWidth: 150 } },
            React.createElement(MenuItem, { icon: 'pen', label: 'Editing', checked: ctx.editMode === 'Editing', onClick: () => ctx.setEditMode('Editing'), close }),
            React.createElement(MenuItem, { icon: 'trackchanges', label: 'Reviewing', checked: ctx.editMode === 'Reviewing', onClick: () => ctx.setEditMode('Reviewing'), close }),
            React.createElement(MenuItem, { icon: 'about', label: 'Viewing', checked: ctx.editMode === 'Viewing', onClick: () => ctx.setEditMode('Viewing'), close })
          ),
        }),
        React.createElement('button', { className: 'tabs-action', onClick: ctx.openShare },
          React.createElement(Icon, { n: 'coediting', size: 14 }), 'Share'),
        React.createElement('button', { className: 'tabs-action', title: 'Open file location' },
          React.createElement(Icon, { n: 'folder', size: 15 })),
        React.createElement('button', {
          className: 'tabs-action', title: 'Mark as favorite',
          onClick: ctx.toggleFav,
        }, React.createElement(Icon, { n: ctx.fav ? 'starfill' : 'star', size: 15, style: ctx.fav ? { color: '#f5b50a' } : null })),
        React.createElement('button', { className: 'tabs-action', title: 'Find (Ctrl+F)', onClick: () => ctx.openLeftPanel('search') },
          React.createElement(Icon, { n: 'search', size: 15 }))
      )
    ),
    React.createElement('div', {
      className: 'ribbon-panel' + (collapsed ? ' collapsed' : ''),
      onMouseDown: (e) => {
        // keep selection in the document when clicking ribbon controls
        const t = e.target;
        if (t.closest('input') || t.closest('[contenteditable]')) return;
        e.preventDefault();
      },
    }, !collapsed && React.createElement(Panel, { ctx }))
  );
}

window.Ribbon = Ribbon;
window.RIBBON_TABS = TABS;
