import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TranslationResult } from '../../utils/types';
import PipelineVisual from './PipelineVisual';

interface TranslationSectionProps {
  translation: TranslationResult | null;
  currentStep: number;
  cSource?: string;
}

export default function TranslationSection({
  translation,
  currentStep,
  cSource,
}: TranslationSectionProps) {
  if (translation === null) {
    return (
      <Box textAlign="center" color="text-body-secondary" padding="xl">
        <SpaceBetween size="s" direction="vertical">
          <Box variant="strong" color="inherit">No program loaded</Box>
          <Box color="inherit">Load a program to see the translation pipeline.</Box>
        </SpaceBetween>
      </Box>
    );
  }

  return (
    <PipelineVisual
      translation={translation}
      currentStep={currentStep}
      cSource={cSource}
    />
  );
}
