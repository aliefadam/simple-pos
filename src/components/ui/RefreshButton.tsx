import { Button } from "./Button";

interface RefreshButtonProps {
  loading?: boolean;
  onClick: () => void | Promise<void>;
  label?: string;
}

export function RefreshButton({
  loading = false,
  onClick,
  label = "Refresh",
}: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      icon="fi fi-rr-refresh"
      loading={loading}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
