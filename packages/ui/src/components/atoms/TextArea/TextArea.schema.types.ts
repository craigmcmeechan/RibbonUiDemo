/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI text area atom.
 */
export interface TextAreaConfig {
  /**
   * Stable text area instance identifier; also the native textarea DOM id.
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
   * Visible number of text rows.
   */
  rows?: number;
  /**
   * Visible width in average character columns.
   */
  cols?: number;
  /**
   * Explicit field density and target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Native resize axis allowed for the field.
   */
  resize?: 'none' | 'vertical' | 'both';
  /**
   * Maximum number of characters accepted by the native textarea.
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
