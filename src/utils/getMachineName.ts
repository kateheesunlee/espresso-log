import { Machine } from '@types';

interface GetMachineNameOptions {
  showDeleted?: boolean;
  useNickname?: boolean;
}

/**
 * Formats a machine name for display.
 * - Uses nickname if available and useNickname is true
 * - Otherwise shows: brand model + grinder
 *   - If model already includes the brand, excludes duplicate brand name
 * - If showDeleted is true, appends " (deleted)"
 * - If machine is null/undefined, returns "Unknown Machine"
 */
export const getMachineName = (
  machine: Machine | null | undefined,
  options: GetMachineNameOptions = {}
): string => {
  const { showDeleted = false, useNickname = false } = options;

  if (!machine) {
    return 'Unknown Machine';
  }

  let name: string;

  if (useNickname && machine.nickname) {
    name = machine.nickname;
  } else {
    // Check if model already includes brand name to avoid duplication
    const modelIncludesBrand = machine.model
      .toLowerCase()
      .includes(machine.brand.toLowerCase());

    if (modelIncludesBrand) {
      // Model already includes brand, just use model
      name = machine.model;
    } else {
      // Model doesn't include brand, combine them
      name = `${machine.brand} ${machine.model}`;
    }

    // Add grinder if available
    if (machine.grinder) {
      name += ` + ${machine.grinder}`;
    }
  }

  if (showDeleted && machine.deleted) {
    name += ' (deleted)';
  }

  return name;
};
