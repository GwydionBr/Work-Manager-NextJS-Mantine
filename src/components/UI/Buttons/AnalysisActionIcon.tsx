import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconChartCovariate } from "@tabler/icons-react";

interface AnalysisActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function AnalysisActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: AnalysisActionIconProps) {
  return (
    <ActionIcon onClick={onClick} size="md" variant="light" {...props}>
      <IconChartCovariate size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
