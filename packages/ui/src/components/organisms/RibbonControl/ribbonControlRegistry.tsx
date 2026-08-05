import type { ReactElement } from 'react';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { IconButton } from '../../atoms/IconButton';
import { Label } from '../../atoms/Label';
import { Separator } from '../../atoms/Separator';
import { ToggleButton } from '../../atoms/ToggleButton';
import {
  BADGE_SCHEMA_ID,
  BUTTON_SCHEMA_ID,
  getRibbonComponentSchemaCatalog,
  ICON_BUTTON_SCHEMA_ID,
  ICON_SCHEMA_ID,
  LABEL_SCHEMA_ID,
  SEPARATOR_SCHEMA_ID,
  TOGGLE_BUTTON_SCHEMA_ID,
} from '../../componentSchemas';
import type { BadgeConfig } from '../../atoms/Badge';
import type { ButtonConfig } from '../../atoms/Button';
import type { IconConfig } from '../../atoms/Icon';
import type { IconButtonConfig } from '../../atoms/IconButton';
import type { LabelConfig } from '../../atoms/Label';
import type { SeparatorConfig } from '../../atoms/Separator';
import type { ToggleButtonConfig } from '../../atoms/ToggleButton';
import type {
  RibbonControlContext,
  RibbonControlDefinition,
  RibbonControlEntry,
} from './RibbonControl.types';

type ResolvedConfig = { ok: true; value: unknown } | { ok: false };

function resolveConfig(
  schemaId: string,
  config: Readonly<Record<string, unknown>>,
): ResolvedConfig {
  const catalogResult = getRibbonComponentSchemaCatalog();
  if (!catalogResult.ok) return { ok: false };
  const normalized = catalogResult.catalog.normalize(schemaId, config);
  return normalized.ok ? { ok: true, value: normalized.value } : { ok: false };
}

function statePressed(
  ctx: RibbonControlContext,
  definition: RibbonControlDefinition,
  fallback: boolean,
): boolean {
  const override = ctx.controlState?.[definition.id]?.['pressed'];
  return typeof override === 'boolean' ? override : fallback;
}

export function renderDiagnostic(message: string): ReactElement {
  return (
    <span
      className="ribbon-ui-ribbon-control__diagnostic"
      data-ribbon-ui-component="ribbon-control-diagnostic"
    >
      {message}
    </span>
  );
}

const entries: Record<string, RibbonControlEntry> = {
  [BUTTON_SCHEMA_ID]: {
    schemaId: BUTTON_SCHEMA_ID,
    render(definition, ctx) {
      const result = resolveConfig(BUTTON_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return (
        <Button
          {...(result.value as ButtonConfig)}
          onPress={() => {
            ctx.onCommand?.(definition.command);
          }}
        />
      );
    },
  },
  [ICON_BUTTON_SCHEMA_ID]: {
    schemaId: ICON_BUTTON_SCHEMA_ID,
    render(definition, ctx) {
      const result = resolveConfig(ICON_BUTTON_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return (
        <IconButton
          {...(result.value as IconButtonConfig)}
          onPress={() => {
            ctx.onCommand?.(definition.command);
          }}
        />
      );
    },
  },
  [TOGGLE_BUTTON_SCHEMA_ID]: {
    schemaId: TOGGLE_BUTTON_SCHEMA_ID,
    render(definition, ctx) {
      const result = resolveConfig(TOGGLE_BUTTON_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      const config = result.value as ToggleButtonConfig;
      const pressed = statePressed(ctx, definition, config.pressed);
      return (
        <ToggleButton
          {...config}
          pressed={pressed}
          onPress={() => {
            ctx.onControlChange?.(definition.id, !pressed);
          }}
        />
      );
    },
  },
  [SEPARATOR_SCHEMA_ID]: {
    schemaId: SEPARATOR_SCHEMA_ID,
    render(definition) {
      const result = resolveConfig(SEPARATOR_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return <Separator {...(result.value as SeparatorConfig)} />;
    },
  },
  [LABEL_SCHEMA_ID]: {
    schemaId: LABEL_SCHEMA_ID,
    render(definition) {
      const result = resolveConfig(LABEL_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return <Label {...(result.value as LabelConfig)} />;
    },
  },
  [BADGE_SCHEMA_ID]: {
    schemaId: BADGE_SCHEMA_ID,
    render(definition) {
      const result = resolveConfig(BADGE_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return <Badge {...(result.value as BadgeConfig)} />;
    },
  },
  [ICON_SCHEMA_ID]: {
    schemaId: ICON_SCHEMA_ID,
    render(definition) {
      const result = resolveConfig(ICON_SCHEMA_ID, definition.config);
      if (!result.ok) return renderDiagnostic(`Invalid control: ${definition.id}`);
      return <Icon {...(result.value as IconConfig)} />;
    },
  },
};

export const ribbonControlRegistry: Readonly<Record<string, RibbonControlEntry>> = Object.freeze({
  ...entries,
});

export function getRibbonControlEntry(type: string): RibbonControlEntry | undefined {
  return ribbonControlRegistry[type];
}
