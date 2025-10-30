export type CustomMutationProps<T = void> = {
  onSuccess?: (data: T) => void;
  onError?: () => void;
  showNotification?: boolean;
  optimisticUpdate?: boolean;
};
