import { SelectOption, SelectRendererProps } from '../types';

export type LabelProps<Item extends SelectOption> = SelectRendererProps<
  Item,
  'label'
>;

/**
 * A contexted label before the Select input.
 */
export default function Label<Item extends SelectOption>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props: LabelProps<Item>,
) {
  return null;
}
