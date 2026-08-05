import type { ColorSwatchConfig } from './ColorSwatch.schema.types';

export type { ColorSwatchConfig };

export interface ColorSwatchRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type ColorSwatchProps = ColorSwatchConfig & ColorSwatchRuntimeProps;
