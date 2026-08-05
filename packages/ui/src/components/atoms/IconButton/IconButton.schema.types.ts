/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the accessible RibbonUI icon button atom.
 */
export interface IconButtonConfig {
  /**
   * Stable icon button instance identifier.
   */
  id: string;
  /**
   * Required accessible name for the icon-only control.
   */
  label: string;
  /**
   * Allowlisted built-in icon rendered without arbitrary markup.
   */
  icon: 'save' | 'undo' | 'redo' | 'search' | 'close' | 'more';
  /**
   * Semantic visual emphasis of the icon button.
   */
  variant?: 'neutral' | 'primary';
  /**
   * Explicit control and icon target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
}
