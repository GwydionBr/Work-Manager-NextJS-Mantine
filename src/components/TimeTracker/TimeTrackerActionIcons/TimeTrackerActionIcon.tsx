import { ActionIcon, ActionIconProps, Indicator, Tooltip } from "@mantine/core";
import { IconStopwatch } from "@tabler/icons-react";
import { TimerState } from "@/stores/timeTrackerStore";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface TimeTrackerActionIconProps extends ActionIconProps {
  action: () => void;
  label: string;
  state: TimerState;
  getStatusColor: () => string;
}

export default function TimeTrackerActionIcon({
  action,
  label,
  state,
  getStatusColor,
  ...props
}: TimeTrackerActionIconProps) {
  return (
    <DelayedTooltip label={label}>
      <Indicator
        color="red"
        size={10}
        processing={state === "running"}
        disabled={state === "stopped"}
      >
        <ActionIcon onClick={action} size="md" color={getStatusColor()}>
          <IconStopwatch />
        </ActionIcon>
      </Indicator>
    </DelayedTooltip>
  );
}
