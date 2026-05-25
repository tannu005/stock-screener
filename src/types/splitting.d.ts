declare module 'splitting' {
  interface SplittingOptions {
    target?: Element | Element[] | NodeListOf<Element> | string;
    by?: string;
    key?: string;
    whitespace?: boolean;
  }

  type SplittingResult = Array<Record<string, unknown>>;

  export default function Splitting(options?: SplittingOptions): SplittingResult;
}
