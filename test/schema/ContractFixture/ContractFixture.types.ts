import type { ContractFixtureConfig } from './ContractFixture.schema.types';

export type { ContractFixtureConfig };

export interface ContractFixtureRuntimeProps {
  onActivate?: (id: string) => void;
}

export type ContractFixtureProps = ContractFixtureConfig & ContractFixtureRuntimeProps;
