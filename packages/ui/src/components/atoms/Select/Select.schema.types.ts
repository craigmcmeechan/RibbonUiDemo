/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI select atom.
 */
export interface SelectConfig {
  /**
   * Stable select instance identifier; also the native select DOM id.
   */
  id: string;
  /**
   * Controlled selected option value owned by the host; empty when omitted.
   */
  value?: string;
  /**
   * Allowlisted option list rendered as native option elements.
   *
   * @minItems 1
   */
  options: [
    {
      /**
       * Option form value submitted when selected.
       */
      value: string;
      /**
       * Option visible text.
       */
      label: string;
    },
    ...{
      /**
       * Option form value submitted when selected.
       */
      value: string;
      /**
       * Option visible text.
       */
      label: string;
    }[],
  ];
  /**
   * Optional placeholder rendered as a disabled first option with an empty value.
   */
  placeholder?: string;
  /**
   * Form field name for native form submission.
   */
  name?: string;
  /**
   * Explicit field density and target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
  /**
   * Whether the field must have a value for native form submission.
   */
  required?: boolean;
}
