import React from 'react';

import FormField, { FormFieldProps } from '../FormField';
import TagChips from '../../TagChips';

interface TagChipsFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  allowCustom?: boolean;
  recent?: string[];
}

const TagChipsField: React.FC<TagChipsFieldProps> = ({
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
      <TagChips
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        allowCustom={allowCustom}
        recent={recent}
      />
    </FormField>
  );
};

export default TagChipsField;
