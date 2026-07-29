import { FC } from 'react';
interface TeachingDesignStepProps {
  className?: string;
}
export const TeachingDesignStep: FC<TeachingDesignStepProps> = ({ className }) => {
  return <div className={className}>Teaching Design Step</div>;
};