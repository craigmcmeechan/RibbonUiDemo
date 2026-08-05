/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI radio atom.
 */
export interface RadioConfig {
  /**
   * Stable radio instance identifier; also the native input DOM id.
   */
  id: string;
  /**
   * Visible text that also supplies the radio accessible name.
   */
  label: string;
  /**
   * Form value submitted when this radio is the selected option in its group.
   */
  value: string;
  /**
   * Controlled checked state rendered by the native input; the host owns the value.
   */
  checked: boolean;
  /**
   * Shared form field name that groups radios natively.
   */
  name: string;
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
  /**
   * Whether the group must have a selection for native form submission.
   */
  required?: boolean;
}
