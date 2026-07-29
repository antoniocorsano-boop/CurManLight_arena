import { FC } from 'react';
interface CurriculumSelectionStepProps {
  className?: string;
}
export const CurriculumSelectionStep: FC<CurriculumSelectionStepProps> = ({ className }) => {
  return <div className={className}>Curriculum Selection Step</div>;
};