import FormField from "./inputs/FormField";
import BalanceSlider from "./inputs/sliders/BalanceSlider";
import {
  TASTE_BALANCE_LABELS,
  TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL,
  TasteBalanceLabel,
} from "../database/UniversalDatabase";

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

const MAX_VALUE = 1;

const TastingNotes = ({
  formData,
  setFormData,
  readOnly = false,
}: TastingNotesProps) => {
  const keyByLabel = (label: TasteBalanceLabel): keyof TastingNotesFormData => {
    return label.toLowerCase().replace(" ", "_") as keyof TastingNotesFormData;
  };

  const handleValueChange = (label: TasteBalanceLabel, value: number) => {
    setFormData?.({ ...formData, [keyByLabel(label)]: value });
  };

  const readonlyValue = (value: number, qualityIndicators: string[]) => {
    const distanceFromZero = (Math.abs(value) / MAX_VALUE) * 100;
    const adverb =
      distanceFromZero <= 10
        ? "Slightly"
        : distanceFromZero <= 70
        ? "Moderately"
        : "Too";

    if (value === 0) return qualityIndicators[1];
    else if (value > 0) {
      return `${adverb} ${qualityIndicators[2].toLowerCase()}`;
    }
    return `${adverb} ${qualityIndicators[0].toLowerCase()}`;
  };

  const readonlySubLabel = (label: TasteBalanceLabel) => {
    return `${readonlyValue(
      formData[keyByLabel(label)],
      TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL[label]
    )}`;
  };

  return (
    <>
      {TASTE_BALANCE_LABELS.map((label) => (
        <FormField
          key={label}
          label={`${label}: ${formData[keyByLabel(label)]}`}
          subLabel={readOnly ? readonlySubLabel(label) : undefined}
        >
          <BalanceSlider
            value={formData[keyByLabel(label)]}
            onValueChange={(value) => handleValueChange(label, value)}
            qualityIndicators={TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL[label]}
            readOnly={readOnly}
          />
        </FormField>
      ))}
    </>
  );
};

export default TastingNotes;
