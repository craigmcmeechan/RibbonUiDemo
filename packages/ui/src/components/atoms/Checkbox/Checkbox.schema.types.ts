/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI checkbox atom.
 */
export interface CheckboxConfig {
  /**
   * Stable checkbox instance identifier; also the native input DOM id.
   */
  id: string;
  /**
   * Visible text that also supplies the checkbox accessible name.
   */
  label: string;
  /**
   * Controlled checked state rendered by the native input; the host owns the value.
   */
  checked: boolean;
  /**
   * Form field name for native form submission.
   */
  name?: string;
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
  /**
   * Whether the field must be checked for native form submission.
   */
  required?: boolean;
}
