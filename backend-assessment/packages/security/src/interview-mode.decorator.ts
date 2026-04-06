import { SetMetadata } from '@nestjs/common';

export const INTERVIEW_MODE_KEY = 'interviewMode';
export const InterviewMode = () => SetMetadata(INTERVIEW_MODE_KEY, true);
