import {
  TASTE_BALANCE_LABELS,
  TasteBalanceLabel,
  TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL,
} from '@types';
import { formatBalance } from '../utils/formatTastingSummary';

import FormField from './inputs/FormField';
import BalanceSlider from './inputs/sliders/BalanceSlider';

interface TastingNotesFormData {
  acidity: number;
  bitterness: number;
  body: number;
  aftertaste: number;
}

interface TastingNotesProps {
  formData: TastingNotesFormData;
  setFormData?: (formData: TastingNotesFormData) => void;
  readOnly?: boolean;
}

const TastingNotes = ({
  formData,
  setFormData,
  readOnly = false,
}: TastingNotesProps) => {
  const keyByLabel = (label: TasteBalanceLabel): keyof TastingNotesFormData => {
    return label.toLowerCase().replace(' ', '_') as keyof TastingNotesFormData;
  };

  const handleValueChange = (label: TasteBalanceLabel, value: number) => {
    setFormData?.({ ...formData, [keyByLabel(label)]: value });
  };

  const readonlySubLabel = (label: TasteBalanceLabel) => {
    return `${formatBalance(
      formData[keyByLabel(label)],
      TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL[label]
    )}`;
  };

  return (
    <>
      {TASTE_BALANCE_LABELS.map(label => (
        <FormField
          key={label}
          label={`${label}: ${formData[keyByLabel(label)]}`}
          subLabel={readOnly ? readonlySubLabel(label) : undefined}
        >
          <BalanceSlider
            value={formData[keyByLabel(label)]}
            onValueChange={value => handleValueChange(label, value)}
            qualityIndicators={TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL[label]}
            readOnly={readOnly}
          />
        </FormField>
      ))}
    </>
  );
};

export default TastingNotes;
