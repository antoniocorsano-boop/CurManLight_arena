import { FC } from 'react';
interface ContextStepProps {
  className?: string;
}
export const ContextStep: FC<ContextStepProps> = ({ className }) => {
  return <div className={className}>Context Step</div>;
};