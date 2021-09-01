import { useMultiStyleConfig } from '@chakra-ui/react';
import { RendererProps } from 'hooks/useRenderers';
import { UseComboboxReturnValue, UseComboboxStateChangeTypes } from 'downshift';
import { MutableRefObject, MouseEventHandler } from 'react';

export type MultiStyles = ReturnType<typeof useMultiStyleConfig>;

export type StrictSelectOption = { label: string; value: any } | { id: string };
export type SelectOptionInArray = [string, any][];
export type SelectOption = string | SelectOptionInArray | StrictSelectOption;
export type ChangeTriggerType =
  | UseComboboxStateChangeTypes
  | 'backspace-delete'
  | 'x-selected-item';

export type ChoiceLoader<Item> = (
  searchInput: string,
) => Item[] | Promise<Item[]>;

export type RendererSharedProps<Item extends SelectOption> = {
  variant?: string;
  size?: string;
  styles: MultiStyles;
  isLoading: boolean;
  itemToString: (item: Item) => string;
  createdIndex: number;
  highlightedIndex: number;
  choices: Item[];
  filteredItems: Item[];
  selectedItems: Item[];
  addSelectedItem: (item: Item, eventType: ChangeTriggerType) => void;
  removeSelectedItem: (item: Item, eventType: ChangeTriggerType) => void;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  needBlur: MutableRefObject<boolean>;
  readOnly: boolean;
  isFocused?: boolean;
} & Pick<
  UseComboboxReturnValue<Item>,
  'openMenu' | 'closeMenu' | 'toggleMenu' | 'isOpen'
>;

export type AllSelectRendererKeys =
  | 'label'
  | 'container'
  | 'input'
  | 'dropdownIndicator'
  | 'menu'
  | 'menuItem'
  | 'selectedItems'
  | 'selectedItem'
  | 'selectedItemContent';

type InputProps = {
  id?: string;
  name?: string;
  placeholder?: string;
  ref: (node: HTMLInputElement | null) => void;
};

/**
 * Extra props for the sub components.
 */
export type SelectRendererExtraProps<Item extends SelectOption> = Record<
  AllSelectRendererKeys,
  {}
> & {
  label: {
    name?: string;
    inputValue: string;
  };
  container: {
    onClick: MouseEventHandler<HTMLDivElement>;
    inputProps: InputProps;
  };
  input: {
    inputProps: InputProps;
  };
  menu: Pick<UseComboboxReturnValue<Item>, 'getItemProps' | 'getMenuProps'>;
  menuItem: Pick<UseComboboxReturnValue<Item>, 'getItemProps'> & {
    index?: number;
    item: Item;
    itemLabel: string;
  };
  dropdownIndicator: {
    isFocused?: boolean;
  };
  selectedItem: {
    item: Item;
    itemLabel: string;
  };
  selectedItemContent: {
    item: Item;
    itemLabel: string;
  };
  selectedItems: {
    selectedItems: Item[];
  };
};

export type SelectRendererProps<
  Item extends SelectOption,
  Key extends AllSelectRendererKeys = AllSelectRendererKeys,
> = RendererSharedProps<Item> &
  RendererProps<Key, never, SelectRendererExtraProps<Item>>;
