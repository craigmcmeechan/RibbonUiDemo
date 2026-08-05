import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Popover } from './Popover';

function renderPopover(
  overrides: Partial<Parameters<typeof Popover>[0]> & { open?: boolean } = {},
) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <button id="trigger" type="button">
        Trigger
      </button>
      <Popover anchorId="trigger" id="pop" onClose={vi.fn()} open={false} {...overrides}>
        <span>Popover content</span>
      </Popover>
    </RibbonThemeProvider>,
  );
}

describe('Popover', () => {
  it('renders nothing when closed and a labelled portal layer when open', () => {
    const { rerender } = renderPopover({ open: false });
    expect(screen.queryByText('Popover content')).toBeNull();

    rerender(
      <RibbonThemeProvider themeId="modern-light">
        <button id="trigger" type="button">
          Trigger
        </button>
        <Popover anchorId="trigger" id="pop" onClose={vi.fn()} open>
          <span>Popover content</span>
        </Popover>
      </RibbonThemeProvider>,
    );
    const layer = document.body.querySelector('[data-ribbon-ui-component="popover"]');
    expect(layer).not.toBeNull();
    expect(layer).toHaveAttribute('data-placement', 'bottom');
    expect(layer).toHaveAttribute('aria-labelledby', 'trigger');
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('uses an aria-label when provided instead of the anchor association', () => {
    renderPopover({ ariaLabel: 'Custom name', open: true });
    const layer = document.body.querySelector('[data-ribbon-ui-component="popover"]');
    expect(layer).toHaveAttribute('aria-label', 'Custom name');
    expect(layer).not.toHaveAttribute('aria-labelledby');
  });

  it('dismisses on outside pointer interaction', () => {
    const onClose = vi.fn();
    renderPopover({ onClose, open: true });
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not dismiss on pointer interaction inside the popover or anchor', () => {
    const onClose = vi.fn();
    renderPopover({ onClose, open: true });
    const layer = document.body.querySelector(
      '[data-ribbon-ui-component="popover"]',
    ) as HTMLElement;
    fireEvent.pointerDown(layer);
    fireEvent.pointerDown(screen.getByText('Trigger'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dismisses on Escape', () => {
    const onClose = vi.fn();
    renderPopover({ onClose, open: true });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('dismisses on resize and scroll', () => {
    const onClose = vi.fn();
    renderPopover({ onClose, open: true });
    fireEvent.resize(window);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.scroll(document.body);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('returns focus to the anchor when it closes', () => {
    const { rerender } = renderPopover({ open: true });
    rerender(
      <RibbonThemeProvider themeId="modern-light">
        <button id="trigger" type="button">
          Trigger
        </button>
        <Popover anchorId="trigger" id="pop" onClose={vi.fn()} open={false}>
          <span>Popover content</span>
        </Popover>
      </RibbonThemeProvider>,
    );
    expect(screen.getByText('Trigger')).toHaveFocus();
  });
});
