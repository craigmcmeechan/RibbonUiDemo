/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI color swatch atom.
 */
export interface ColorSwatchConfig {
  /**
   * Stable color swatch instance identifier.
   */
  id: string;
  /**
   * Hex color value applied as the chip fill via an inline style.
   */
  color: string;
  /**
   * Optional accessible name; when present the swatch becomes a role=img element.
   */
  label?: string;
  /**
   * Explicit chip diameter.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Chip corner shape.
   */
  shape?: 'square' | 'circle';
}
