import { chakra, Button, Text } from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { SelectOption, SelectRendererProps } from '../types';

export type MenuProps<Item extends SelectOption> = SelectRendererProps<
  Item,
  'menu'
>;

export type MenuItemProps<Item extends SelectOption> = SelectRendererProps<
  Item,
  'menuItem'
>;

export function MenuItem<Item extends SelectOption>({
  index,
  createdIndex,
  item,
  itemToString,
  highlightedIndex,
  styles,
  getItemProps,
}: MenuItemProps<Item>) {
  const { isSelected, ...itemProps } = getItemProps({
    item,
    index,
  });
  const label = itemToString(item);
  return (
    <Button
      type="button"
      isActive={highlightedIndex === index}
      __css={styles.menuItem}
      {...itemProps}
    >
      {index === createdIndex ? `Create "${label}"` : label}
    </Button>
  );
}

export default function Menu<Item extends SelectOption>({
  render,
  isOpen,
  filteredItems,
  getMenuProps,
  getItemProps,
  itemToString,
  isLoading,
  readOnly,
  styles,
  selectedItems,
}: MenuProps<Item>) {
  const { ref: menuRef, ...menuProps } = getMenuProps({});

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const referenceElement = useRef<HTMLDivElement | null>(null);

  const {
    styles: popperStyles,
    attributes,
    update: updateMenuPosition,
  } = usePopper(referenceElement.current, popperElement, {
    placement: 'bottom-start',
  });

  const menuItems = useMemo(
    () =>
      !readOnly &&
      isOpen &&
      filteredItems.length > 0 && (
        <chakra.div __css={styles.menuList}>
          {isLoading ? (
            <Text color="gray.500" paddingX={4}>
              Loading...
            </Text>
          ) : (
            filteredItems.map((item, index) => {
              const itemLabel = itemToString(item);
              const node = render('menuItem', {
                item,
                itemLabel,
                index,
                getItemProps,
                key: itemLabel,
              });
              return node;
            })
          )}
        </chakra.div>
      ),
    [
      filteredItems,
      getItemProps,
      isLoading,
      isOpen,
      itemToString,
      readOnly,
      render,
      styles.menuList,
    ],
  );

  // adding/removing items may change container height and menu position.
  useEffect(() => {
    if (isOpen && updateMenuPosition) {
      updateMenuPosition();
    }
  }, [selectedItems.length, isOpen, updateMenuPosition]);

  return (
    <chakra.div __css={styles.menuWrap}>
      <div
        ref={elem => {
          referenceElement.current = elem;
        }}
        style={popperStyles.reference}
      />
      <chakra.div
        ref={elem => {
          menuRef(elem);
          setPopperElement(elem);
        }}
        __css={styles.menu}
        style={popperStyles.popper}
        {...attributes.popper}
        {...menuProps}
      >
        {menuItems}
      </chakra.div>
    </chakra.div>
  );
}
