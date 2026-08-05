import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { useRibbonTheme } from '../../../theme';
import './Popover.css';
import type { PopoverProps } from './Popover.types';

export function Popover({
  anchorId,
  ariaLabel,
  children,
  className,
  id,
  onClose,
  open,
  placement = 'bottom',
}: PopoverProps): ReactElement | null {
  useRibbonTheme();
  const ref = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const classes = className === undefined ? 'ribbon-ui-popover' : `ribbon-ui-popover ${className}`;

  // Return focus to the anchor when the popover closes.
  useEffect(() => {
    if (wasOpen.current && !open) {
      const anchor = anchorId === undefined ? null : document.getElementById(anchorId);
      anchor?.focus();
    }
    wasOpen.current = open;
  }, [open, anchorId]);

  // Dismiss listeners while open.
  useEffect(() => {
    if (!open) return;
    const popover = ref.current;
    const view = window;

    function isInside(node: Node | null): boolean {
      if (node === null) return false;
      if (popover !== null && popover.contains(node)) return true;
      const anchor = anchorId === undefined ? null : document.getElementById(anchorId);
      return anchor !== null && anchor.contains(node);
    }

    function handlePointerDown(event: PointerEvent): void {
      if (!isInside(event.target as Node | null)) onClose?.();
    }

    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose?.();
    }

    function handleClose(): void {
      onClose?.();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    view.addEventListener('resize', handleClose);
    document.addEventListener('scroll', handleClose, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      view.removeEventListener('resize', handleClose);
      document.removeEventListener('scroll', handleClose, true);
    };
  }, [open, anchorId, onClose]);

  if (!open) return null;

  const anchor = anchorId === undefined ? null : document.getElementById(anchorId);
  const rect = anchor?.getBoundingClientRect();
  const style: CSSProperties = { position: 'fixed' };
  if (rect !== undefined) {
    if (placement === 'bottom') {
      style.top = `${String(rect.bottom)}px`;
    } else {
      style.bottom = `${String(window.innerHeight - rect.top)}px`;
    }
    style.left = `${String(rect.left)}px`;
  }

  return createPortal(
    <div
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel === undefined ? anchorId : undefined}
      className={classes}
      data-ribbon-ui-component="popover"
      data-placement={placement}
      id={id}
      ref={ref}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
}
