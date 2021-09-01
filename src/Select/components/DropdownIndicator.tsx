import { chakra, Icon } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { SelectOption, SelectRendererProps } from '../types';

export type DropdownIndicatorProps<Item extends SelectOption> =
  SelectRendererProps<Item, 'dropdownIndicator'>;

export default function DropdownIndicator<Item extends SelectOption>({
  styles,
  size,
  isOpen,
  isFocused,
  needBlur,
  openMenu,
  closeMenu,
  inputRef,
}: DropdownIndicatorProps<Item>) {
  return (
    <chakra.div
      __css={{
        ...styles.indicator,
        ...(isFocused ? styles.indicatorFocused : undefined),
      }}
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.button === 0) {
          // eslint-disable-next-line no-param-reassign
          needBlur.current = false;
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
            inputRef.current?.focus();
          }
        }
      }}
    >
      <Icon size={size} as={ChevronDownIcon} />
    </chakra.div>
  );
}
