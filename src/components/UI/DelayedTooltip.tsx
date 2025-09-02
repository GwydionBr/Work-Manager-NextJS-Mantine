import { Tooltip, TooltipProps } from "@mantine/core";

interface DelayedTooltipProps extends TooltipProps {
  openDelay?: number;
  closeDelay?: number;
}

export default function DelayedTooltip({
  children,
  label = "",
  openDelay = 1000,
  closeDelay = 200,
  ...props
}: DelayedTooltipProps) {
  return (
    <Tooltip
      label={label}
      openDelay={openDelay}
      closeDelay={closeDelay}
      disabled={label === ""}
      {...props}
    >
      {children}
    </Tooltip>
  );
}
