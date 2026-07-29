import { FC } from 'react';
interface WorkflowProgressProps {
  className?: string;
}
export const WorkflowProgress: FC<WorkflowProgressProps> = ({ className }) => {
  return <div className={className}>Workflow Progress</div>;
};