/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI badge atom.
 */
export interface BadgeConfig {
  /**
   * Stable badge instance identifier.
   */
  id: string;
  /**
   * Visible text content of the badge.
   */
  label: string;
  /**
   * Semantic tone of the badge; success/warning/danger are deferred until status tokens exist.
   */
  tone?: 'neutral' | 'primary';
}
