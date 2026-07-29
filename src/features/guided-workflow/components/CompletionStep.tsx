import { FC } from 'react';
interface CompletionStepProps {
  className?: string;
}
export const CompletionStep: FC<CompletionStepProps> = ({ className }) => {
  return <div className={className}>Completion Step</div>;
};