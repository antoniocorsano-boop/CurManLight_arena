import { FC } from 'react';
interface DesignReviewStepProps {
  className?: string;
}
export const DesignReviewStep: FC<DesignReviewStepProps> = ({ className }) => {
  return <div className={className}>Design Review Step</div>;
};