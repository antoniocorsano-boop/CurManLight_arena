import { FC } from 'react';
interface DocumentPreparationStepProps {
  className?: string;
}
export const DocumentPreparationStep: FC<DocumentPreparationStepProps> = ({ className }) => {
  return <div className={className}>Document Preparation Step</div>;
};