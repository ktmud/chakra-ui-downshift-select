import { chakra, Input as BaseInput } from '@chakra-ui/react';
import AutosizeInput from 'react-input-autosize';
import { SelectOption } from '../types';
import { InputContainerProps } from './Container';

export type InputProps<Item extends SelectOption> = Omit<
  InputContainerProps<Item>,
  'onClick'
>;

export default function Input<Item extends SelectOption>({
  variant,
  size,
  styles,
  inputProps: { ref, placeholder, ...inputProps },
}: InputProps<Item>) {
  return variant === 'list' ? (
    <BaseInput
      {...inputProps}
      ref={ref}
      placeholder={placeholder}
      size={size}
    />
  ) : (
    <chakra.div
      __css={{
        ...styles.input,
        minWidth: `${(placeholder?.length || 0) / 2}em`,
      }}
      as={AutosizeInput}
      inputRef={ref}
      placeholder={placeholder}
      {...inputProps}
    />
  );
}
