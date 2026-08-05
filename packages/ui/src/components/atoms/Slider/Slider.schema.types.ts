/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI slider atom.
 */
export interface SliderConfig {
  /**
   * Stable slider instance identifier; also the native input DOM id.
   */
  id: string;
  /**
   * Controlled numeric value owned by the host.
   */
  value?: number;
  /**
   * Minimum allowed value.
   */
  min?: number;
  /**
   * Maximum allowed value.
   */
  max?: number;
  /**
   * Step between allowed values; 0 is treated as any by the host.
   */
  step?: number;
  /**
   * Form field name for native form submission.
   */
  name?: string;
  /**
   * Explicit control density and target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
}
