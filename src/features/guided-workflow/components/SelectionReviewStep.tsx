import { FC } from 'react';
interface SelectionReviewStepProps {
  className?: string;
}
export const SelectionReviewStep: FC<SelectionReviewStepProps> = ({ className }) => {
  return <div className={className}>Selection Review Step</div>;
};