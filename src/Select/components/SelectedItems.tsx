import React from 'react';
import { SelectOption, SelectRendererProps } from '../types';

export type SelectedItemsProps<Item extends SelectOption> = SelectRendererProps<
  Item,
  'selectedItems'
>;

export default function SelectedItems<Item extends SelectOption>({
  itemToString,
  selectedItems,
  render,
}: SelectedItemsProps<Item>) {
  return (
    <>
      {selectedItems.map(item => {
        const label = itemToString(item);
        return render('selectedItem', {
          key: `selected-item-${label}`,
          item,
          itemLabel: label,
        });
      })}
    </>
  );
}
