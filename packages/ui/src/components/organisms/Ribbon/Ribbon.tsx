import { type KeyboardEvent, type ReactElement, useRef } from 'react';

import { useRibbonTheme } from '../../../theme';
import { RibbonGroup } from '../../molecules/RibbonGroup';
import { RibbonTab } from '../../molecules/RibbonTab';
import { RibbonControl } from '../RibbonControl';
import './Ribbon.css';
import type { RibbonProps } from './Ribbon.types';

export function Ribbon({
  activeTab,
  children,
  className,
  controlState,
  definition,
  id,
  label,
  onCommand,
  onControlChange,
  onRibbonPointerDown,
  onSelectTab,
}: RibbonProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-ribbon' : `ribbon-ui-ribbon ${className}`;
  const tablistRef = useRef<HTMLDivElement>(null);
  const activeTabDefinition = definition.tabs.find((tab) => tab.id === activeTab);
  const panelId = `${id}-${activeTab}-panel`;

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const tablist = tablistRef.current;
    if (tablist === null) return;
    const tabs = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (tabs.length === 0) return;
    const current = tablist.ownerDocument.activeElement as HTMLElement | null;
    const currentIndex = tabs.findIndex((tab) => tab === current);
    let nextIndex: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab === undefined) return;
    nextTab.focus();
    onSelectTab?.(nextTab.id);
  }

  return (
    <div className={classes} data-ribbon-ui-component="ribbon">
      <div
        aria-label={label}
        className="ribbon-ui-ribbon__tabs"
        onKeyDown={handleTabKeyDown}
        onMouseDown={onRibbonPointerDown}
        ref={tablistRef}
        role="tablist"
      >
        {definition.tabs.map((tab) => (
          <RibbonTab
            active={tab.id === activeTab}
            ariaControls={tab.id === activeTab ? panelId : undefined}
            id={tab.id}
            key={tab.id}
            label={tab.label}
            onSelect={() => {
              onSelectTab?.(tab.id);
            }}
          />
        ))}
      </div>
      <div
        aria-labelledby={activeTabDefinition === undefined ? undefined : activeTabDefinition.id}
        className="ribbon-ui-ribbon__panel"
        id={panelId}
        role="tabpanel"
      >
        {activeTabDefinition?.groups.map((group) => (
          <RibbonGroup id={group.id} key={group.id} label={group.label}>
            {group.controls.map((control) => (
              <RibbonControl
                controlState={controlState}
                definition={control}
                id={`${id}-control-${control.id}`}
                key={control.id}
                onCommand={onCommand}
                onControlChange={onControlChange}
              />
            ))}
          </RibbonGroup>
        ))}
        {children}
      </div>
    </div>
  );
}
