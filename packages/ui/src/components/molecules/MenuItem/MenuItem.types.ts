import type { MenuItemConfig } from './MenuItem.schema.types';

export type { MenuItemConfig };

export interface MenuItemRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Activation callback; runtime-only and never serialized. */
  readonly onSelect?: () => void;
}

export type MenuItemProps = MenuItemConfig & MenuItemRuntimeProps;
