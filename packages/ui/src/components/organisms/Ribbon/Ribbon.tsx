import type { ReactElement } from 'react';

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
  const activeTabDefinition = definition.tabs.find((tab) => tab.id === activeTab);
  const panelId = `${id}-${activeTab}-panel`;

  return (
    <div className={classes} data-ribbon-ui-component="ribbon">
      <div
        aria-label={label}
        className="ribbon-ui-ribbon__tabs"
        onMouseDown={onRibbonPointerDown}
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
