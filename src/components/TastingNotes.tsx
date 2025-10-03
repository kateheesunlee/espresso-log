import {
  TASTE_BALANCE_LABELS,
  TasteBalanceLabel,
  TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL,
} from "@types";

import FormField from "./inputs/FormField";
import BalanceSlider from "./inputs/sliders/BalanceSlider";

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

function intensityAdverb(vAbs: number) {
  const pct = (vAbs / MAX_VALUE) * 100;
  if (pct <= 10) return "Slightly";
  if (pct <= 70) return "Moderately";
  if (pct <= 90) return "Very";
  return "Too";
}

/**
 * value: -1..1
 * labels: [left, center, right]
 * center is "Sweet Spot" without an adverb
 * left and right are an adverb + lowercase adjective
 */
function formatReadonlyBalance(
  value: number,
  labels: [string, string, string]
) {
  const [left, center, right] = labels;

  if (value === 0) return center; // Sweet Spot (no adverb)

  const adverb = intensityAdverb(Math.abs(value));
  const side = value > 0 ? right : left;

  return `${adverb} ${side.toLowerCase()}`;
}

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

  const readonlySubLabel = (label: TasteBalanceLabel) => {
    return `${formatReadonlyBalance(
      formData[keyByLabel(label)],
      TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL[label] as [
        string,
        string,
        string
      ]
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
