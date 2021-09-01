import { chakra } from '@chakra-ui/react';
import { ComponentType, ReactNode } from 'react';

export type AnyProps = Record<string, any>;

export type RendererProps<
  Key,
  TData extends AnyProps,
  ExtraProps extends Record<string, AnyProps>,
> = {
  data?: TData;
  value: Key extends keyof TData
    ? TData[Key]
    : Key extends keyof ExtraProps
    ? ExtraProps[Key] extends { value?: any }
      ? ExtraProps[Key]['value']
      : never
    : undefined;
  // allow render other parts within a component, because we
  // don't know what extra props other renders need.
  render: <K extends keyof TData | keyof ExtraProps>(
    key: K,
    extraProps?: {
      key?: string | number;
    } & (K extends keyof ExtraProps ? ExtraProps[K] : {}),
  ) => ReactNode;
  // supply current component's extra props
} & (Key extends keyof ExtraProps ? ExtraProps[Key] : {});

export type RendererDict<
  /**
   * Type for the `data` prop, keys of this prop can be used as renderer keys.
   */
  TData extends AnyProps,
  /**
   * Shared props for all renderers.
   */
  SharedProps extends AnyProps,
  ExtraProps extends Record<string, AnyProps>,
> = {
  [key in keyof TData | keyof ExtraProps]?: ComponentType<
    RendererProps<key, TData, ExtraProps> & SharedProps
  >;
};

export type WithRendererProps<
  TData extends AnyProps,
  SharedProps extends AnyProps,
  ExtraProps extends Record<string, AnyProps>,
> = {
  renderers?: Partial<RendererDict<TData, SharedProps, ExtraProps>>;
};

const EMPTY_VALUE_PLACEHOLDER = <chakra.span color="gray.500">-</chakra.span>;

/**
 * Accept a mapping of renderers and returns a `render` function that render
 * the specific parts with some shared props. This is useful for splitting a
 * component into multiple customizable parts.
 *
 * Example:
 *
 *    ```
 *    const defaultRenderers = {
 *      header: ({ title }) => <h1>{title}</h1>,
 *      body: ({ content }) => <p>{content}</p>,
 *      footer: ({ render }) => <footer>{render('logo')}</footer>,
 *      logo: ({ name }) => <a>{name}</a>,
 *    }
 *
 *    function MyComponent({ renderers }) {
 *
 *      const data = {
 *        field1: 1,
 *        field2: 222,
 *      }
 *
 *      const render = useRenderers({
 *        ...defaultRenderers,
 *        ...renderers,
 *      }, {
 *        data,
 *        title: 'Hello',
 *        content: 'World',
 *        name: 'Joe Doe',
 *        ...[any shared props]...
 *      });
 *
 *      return (
 *        <>
 *          <!-- props from `data` is automatically added as renderer key -->
 *          {render('field1')}
 *          {render('header')}
 *          {render('body')}
 *          {render('footer')}
 *        </>
 *      )
 *    }
 *    ```
 *
 * Note all renderers must be placed outside of your component to make them
 * identifiable to React so to avoid unnecesary rerender & remounting.
 */
export default function useRenderers<
  TData extends AnyProps,
  SharedProps extends AnyProps,
  ExtraProps extends Record<string, AnyProps>,
  AllRendererKeys extends string = Exclude<
    keyof TData | keyof ExtraProps,
    number | symbol
  >,
>(
  renderers: RendererDict<TData, SharedProps, ExtraProps>,
  {
    data,
    ...sharedProps
  }: {
    data?: TData;
  } & SharedProps,
) {
  const render = <K extends AllRendererKeys>(
    key: K,
    extraProps?: { key?: string | number } & (K extends keyof ExtraProps
      ? ExtraProps[K]
      : {}),
  ) => {
    const value = data && key in data ? data[key as keyof TData] : undefined;
    if (key in renderers && renderers[key]) {
      // local type is only used to suppress warnings
      const Comp = renderers[key] as ComponentType<{
        data?: TData;
        value?: typeof value;
        render: typeof render;
      }>;
      return (
        <Comp
          data={data}
          value={value}
          render={render}
          {...sharedProps}
          {...extraProps}
        />
      );
    }
    return data && key in data
      ? String(value ?? '') || EMPTY_VALUE_PLACEHOLDER
      : value;
  };
  return render;
}
