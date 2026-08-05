/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI switch atom.
 */
export interface SwitchConfig {
  /**
   * Stable switch instance identifier.
   */
  id: string;
  /**
   * Visible text that supplies the switch accessible name.
   */
  label: string;
  /**
   * Controlled on/off state rendered as aria-checked; the host owns the value.
   */
  checked: boolean;
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
  /**
   * Explicit control density and target size.
   */
  size?: 'small' | 'medium' | 'large';
}
