import React from 'react';

import SingleSelectChips from '../../SingleSelectChips';
import FormField, { FormFieldProps } from '../FormField';

interface SingleSelectChipsFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string | string[];
  onChange: (value: string) => void;
  suggestions?: string[];
  allowCustom?: boolean;
  recent?: string[];
}

const SingleSelectChipsField: React.FC<SingleSelectChipsFieldProps> = ({
  label,
  subtitle,
  required = false,
  value,
  onChange,
  suggestions = [],
  allowCustom = true,
  recent = [],
}) => {
  return (
    <FormField label={label} required={required} subtitle={subtitle}>
      <SingleSelectChips
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        allowCustom={allowCustom}
        recent={recent}
      />
    </FormField>
  );
};

export default SingleSelectChipsField;
