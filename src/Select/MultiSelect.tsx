/* eslint-disable no-underscore-dangle */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  useCombobox,
  useMultipleSelection,
  UseMultipleSelectionProps,
} from 'downshift';
import useRenderers, { WithRendererProps } from 'hooks/useRenderers';
import { InputProps, useMultiStyleConfig } from '@chakra-ui/react';
import {
  ChangeTriggerType,
  ChoiceLoader,
  SelectOption,
  RendererSharedProps,
  SelectRendererExtraProps,
  AllSelectRendererKeys,
} from './types';
import Menu, { MenuItem } from './components/Menu';
import SelectedItems from './components/SelectedItems';
import DropdownIndicator from './components/DropdownIndicator';
import Input from './components/Input';
import Container from './components/Container';
import SelectedItem from './components/SelectedItem';
import Label from './components/Label';

export type MultiSelectProps<
  Item extends SelectOption,
  ItemValue = Item extends { value: any } ? Item['value'] : Item,
> = Pick<UseMultipleSelectionProps<Item>, 'initialSelectedItems'> &
  WithRendererProps<
    never,
    RendererSharedProps<Item>,
    SelectRendererExtraProps<Item>
  > & {
    id?: string;
    name?: string;
    value?: (Item | ItemValue)[];
    placeholder?: string;
    variant?: 'input' | 'list';
    size?: InputProps['size'];
    choices?: Item[] | ChoiceLoader<Item>;
    readOnly?: boolean;
    /**
     * Whether to allow creating a new item via typing.
     */
    creatable?: boolean;
    /**
     * Whether to remove the whitespaces around the input text.
     */
    trimInput?: boolean;
    /**
     * Whether to close menu when an item is selected.
     */
    closeOnSelect?: boolean;
    /**
     * Whether to clear search input when an item is selected.
     */
    clearSearchOnSelect?: boolean;
    itemToString?: (item: Item) => string;
    getItemValue?: (item: Item) => ItemValue;
    filterItems?: (items: Item[], search: string) => Item[];
    onChange?: (items: Item[], eventType?: ChangeTriggerType) => void;
    onInputChange?: (inputString?: string) => void;
  };

/**
 * Downshift `useCombobox` on Chakra UI.
 */
export default function MultiSelect<Item extends SelectOption>({
  choices: choices_,
  value,
  itemToString: itemToString_,
  filterItems: filterItems_,
  renderers,
  id,
  name,
  placeholder,
  size = 'md',
  variant = 'input',
  creatable = true,
  trimInput = true,
  closeOnSelect = true,
  clearSearchOnSelect = true,
  readOnly = false,
  onInputChange,
  onChange = () => {},
}: MultiSelectProps<Item>) {
  const [inputValue, setInputValue] = useState('');
  const trimmedInputValue = trimInput ? inputValue.trim() : inputValue;
  const styles = useMultiStyleConfig('MultiSelect', { size, variant });
  const isAsync = typeof choices_ === 'function';
  const [isFocused, setIsFocus] = useState(false);
  const [loadedChoices, setLoadedChoices] = useState(
    isAsync ? undefined : (choices_ as Item[]),
  );
  const [isLoading, setIsLoading] = useState(isAsync);

  const choices = useMemo(() => loadedChoices || [], [loadedChoices]);

  const itemToString: typeof itemToString_ = useMemo(
    () =>
      itemToString_ ||
      (item =>
        typeof item === 'string'
          ? item
          : item && 'id' in item
          ? item.id || ''
          : item && 'label' in item
          ? item.label || ''
          : ''),
    [itemToString_],
  );

  const filterItems: typeof filterItems_ = useMemo(
    () =>
      filterItems_ ||
      ((items, search) =>
        items.filter(x =>
          itemToString(x).toLowerCase().startsWith(search.toLowerCase()),
        )),
    [filterItems_, itemToString],
  );

  // value converted to known choices
  const selectedChoices = useMemo(() => {
    const choicesByLabel = {};
    choices.forEach(choice => {
      choicesByLabel[itemToString(choice)] = choice;
    });
    return (value || []).map(
      item => choicesByLabel[itemToString(item)] || item,
    );
  }, [itemToString, value, choices]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const changeTrigger = useRef<ChangeTriggerType>();
  const needBlur = useRef(false);

  const changeInputValue = useCallback(
    (inputVal: string | undefined) => {
      setInputValue(inputVal || '');
      if (onInputChange) {
        onInputChange(inputVal);
      }
    },
    [onInputChange],
  );

  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({
    itemToString,
    selectedItems: selectedChoices,
    onSelectedItemsChange: ({ selectedItems: newSelectedItems }) => {
      onChange(newSelectedItems || [], changeTrigger.current);
    },
  });

  const selectedItemsIds = useMemo(
    () => new Set(selectedItems.map(itemToString)),
    [itemToString, selectedItems],
  );

  const [createdIndex, filteredItems] = useMemo(() => {
    let createdOptionIndex = -1;
    const filteredOptions = filterItems(
      choices.filter(item => !selectedItemsIds.has(itemToString(item))),
      trimmedInputValue,
    );
    if (
      creatable &&
      trimmedInputValue &&
      !choices
        .concat(selectedItems)
        .find(x => itemToString(x) === trimmedInputValue)
    ) {
      createdOptionIndex = filteredOptions.length;
      filteredOptions.push({
        label: trimmedInputValue,
        value: trimmedInputValue,
      } as Item);
    }
    return [createdOptionIndex, filteredOptions];
  }, [
    filterItems,
    choices,
    creatable,
    trimmedInputValue,
    selectedItems,
    selectedItemsIds,
    itemToString,
  ]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
    closeMenu,
    toggleMenu,
  } = useCombobox({
    inputValue,
    inputId: id,
    defaultHighlightedIndex: isFocused ? 0 : -1, // after selection, highlight the first item.
    items: filteredItems,
    itemToString,
    stateReducer: (state, { changes, type, index }) => {
      // Click item or press Enter
      if (
        type === useCombobox.stateChangeTypes.ItemClick ||
        type === useCombobox.stateChangeTypes.InputKeyDownEnter
      ) {
        return {
          ...changes,
          // select previous item when current item is added to the selected list
          highlightedIndex: Math.max(
            0,
            Math.min((index || 0) - 1, filteredItems.length - 2),
          ),
          inputValue: clearSearchOnSelect ? '' : state.inputValue,
          isOpen: !closeOnSelect,
        };
      }
      return changes;
    },
    onStateChange: ({ inputValue: inputVal, type, selectedItem }) => {
      needBlur.current = false;
      if (type === useCombobox.stateChangeTypes.InputChange) {
        changeInputValue(inputVal || '');
        return;
      }
      if (type === useCombobox.stateChangeTypes.InputBlur) {
        setIsFocus(false);
      }
      if (
        (type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
          type === useCombobox.stateChangeTypes.ItemClick ||
          type === useCombobox.stateChangeTypes.InputBlur) &&
        selectedItem
      ) {
        if (clearSearchOnSelect) {
          changeInputValue('');
        }
        changeTrigger.current = type;
        addSelectedItem(
          createdIndex !== -1 &&
            filteredItems[createdIndex] === selectedItem &&
            'value' in selectedItem &&
            'label' in selectedItem
            ? selectedItem.value
            : selectedItem,
        );
      }
    },
  });

  const loadChoices = useCallback(
    (input: string) => {
      if (isAsync) {
        const result = (choices_ as ChoiceLoader<Item>)(input);
        if (result instanceof Promise) {
          result
            .then(items => {
              setLoadedChoices(items);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    },
    [choices_, isAsync],
  );

  const dropdownProps = useMemo(
    () =>
      getDropdownProps({
        preventKeyAction: isOpen,
      }),
    [getDropdownProps, isOpen],
  );

  const inputProps = useMemo(
    () =>
      getInputProps({
        id,
        name,
        placeholder,
        readOnly,
        ref: el => {
          inputRef.current = el;
          dropdownProps.ref(el);
        },
        onFocus: () => {
          if (isAsync && !loadedChoices) {
            loadChoices(inputValue);
          }
          if (!isOpen) {
            openMenu();
          }
          if (!isFocused) {
            setIsFocus(true);
          }
          needBlur.current = false;
        },
        onBlur: () => {
          needBlur.current = true;
          setTimeout(() => {
            if (needBlur.current) {
              setIsFocus(false);
            }
          }, 50);
        },
        onKeyDown: e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          } else if (
            e.key === 'Backspace' &&
            selectedItems.length > 0 &&
            !e.currentTarget.value
          ) {
            // the default `onKeyDown` event will delete the item already
            changeTrigger.current = 'backspace-delete';
          }
          if (dropdownProps.onKeyDown) {
            dropdownProps.onKeyDown(e);
          }
        },
      }),
    [
      dropdownProps,
      getInputProps,
      id,
      inputValue,
      isAsync,
      isFocused,
      isOpen,
      loadChoices,
      loadedChoices,
      name,
      openMenu,
      placeholder,
      readOnly,
      selectedItems.length,
    ],
  );

  const sharedProps: RendererSharedProps<Item> = useMemo(
    () => ({
      variant,
      size,
      styles,
      isOpen,
      isLoading,
      itemToString,
      openMenu,
      closeMenu,
      toggleMenu,
      readOnly,
      removeSelectedItem: (item, eventType: ChangeTriggerType) => {
        changeTrigger.current = eventType;
        removeSelectedItem(item);
      },
      addSelectedItem: (item, eventType: ChangeTriggerType) => {
        changeTrigger.current = eventType;
        removeSelectedItem(item);
      },
      choices,
      selectedItems,
      filteredItems,
      highlightedIndex,
      createdIndex,
      inputRef,
      needBlur,
    }),
    [
      choices,
      closeMenu,
      createdIndex,
      filteredItems,
      highlightedIndex,
      isLoading,
      isOpen,
      itemToString,
      openMenu,
      readOnly,
      removeSelectedItem,
      selectedItems,
      size,
      styles,
      toggleMenu,
      variant,
    ],
  );

  const render = useRenderers<
    never,
    RendererSharedProps<Item>,
    SelectRendererExtraProps<Item>,
    AllSelectRendererKeys
  >(
    {
      input: Input,
      container: Container,
      menu: Menu,
      menuItem: MenuItem,
      dropdownIndicator: DropdownIndicator,
      selectedItem: SelectedItem,
      selectedItems: SelectedItems,
      label: Label,
      ...renderers,
    },
    sharedProps,
  );

  return (
    <>
      {render('label', { name, inputValue })}
      <div {...getComboboxProps()}>
        {render('container', {
          inputProps,
          onClick: dropdownProps.onClick,
        })}
      </div>
      {render('menu', {
        getMenuProps,
        getItemProps,
      })}
    </>
  );
}
