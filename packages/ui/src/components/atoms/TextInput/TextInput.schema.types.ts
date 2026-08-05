/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI text input atom.
 */
export interface TextInputConfig {
  /**
   * Stable text input instance identifier; also the native input DOM id.
   */
  id: string;
  /**
   * Controlled value owned by the host; empty when omitted.
   */
  value?: string;
  /**
   * Placeholder shown when the value is empty.
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
   * Native input type; numeric types are handled by other atoms.
   */
  inputType?: 'text' | 'email' | 'password' | 'search' | 'url';
  /**
   * Maximum number of characters accepted by the native input.
   */
  maxLength?: number;
  /**
   * Whether native editing and focus participation are disabled.
   */
  disabled?: boolean;
  /**
   * Whether the value is readable but not editable.
   */
  readonly?: boolean;
  /**
   * Whether the field must be filled for native form submission.
   */
  required?: boolean;
}
