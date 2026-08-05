import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HarnessFixture } from './HarnessFixture';

describe('HarnessFixture', () => {
  it('toggles its pressed state and announced status', async () => {
    const user = userEvent.setup();
    render(<HarnessFixture />);

    const button = screen.getByRole('button', { name: 'Activate harness' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(screen.getByRole('button', { name: 'Deactivate harness' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Harness is active.');
  });

  it('supports an initially active state', () => {
    render(<HarnessFixture initiallyActive label="Active fixture" />);

    expect(screen.getByRole('heading', { name: 'Active fixture' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate harness' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
