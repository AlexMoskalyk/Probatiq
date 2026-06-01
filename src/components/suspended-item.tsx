import { ReactNode, Suspense } from "react";

type SuspendedItemProps<T> = {
  item: Promise<T>;
  fallback: ReactNode;
  result: (item: T) => ReactNode;
};

type InnerComponentProps<T> = {
  item: Promise<T>;
  result: (item: T) => ReactNode;
};

export function SuspendedItem<T>(props: SuspendedItemProps<T>) {
  const { item, fallback, result } = props;
  return (
    <Suspense fallback={fallback}>
      <InnerComponent item={item} result={result} />
    </Suspense>
  );
}

async function InnerComponent<T>(props: InnerComponentProps<T>) {
  const { item, result } = props;
  return result(await item);
}
