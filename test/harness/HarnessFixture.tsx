import { useState } from 'react';

export interface HarnessFixtureProps {
  initiallyActive?: boolean;
  label?: string;
}

export function HarnessFixture({
  initiallyActive = false,
  label = 'Verification harness',
}: HarnessFixtureProps) {
  const [isActive, setIsActive] = useState(initiallyActive);

  return (
    <section aria-labelledby="harness-title">
      <h2 id="harness-title">{label}</h2>
      <button
        aria-pressed={isActive}
        onClick={() => {
          setIsActive((current) => !current);
        }}
        type="button"
      >
        {isActive ? 'Deactivate harness' : 'Activate harness'}
      </button>
      <p aria-live="polite" role="status">
        Harness is {isActive ? 'active' : 'inactive'}.
      </p>
    </section>
  );
}
