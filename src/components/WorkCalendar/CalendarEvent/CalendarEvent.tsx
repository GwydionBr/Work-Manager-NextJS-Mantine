import { Box, Stack, Text, HoverCard } from "@mantine/core";
import { CalendarSession, clamp, getProjectColor } from "../calendarUtils";
import { ViewMode } from "@/types/workCalendar.types";
import { formatTimeSpan } from "@/utils/workHelperFunctions";

interface CalendarEventProps {
  s: CalendarSession;
  toY: (date: Date) => number;
  visibleProjects: {
    id: string;
    title: string;
    colors: {
      rail: string;
      border: string;
      fill: string;
    };
  }[];
  projects: { id: string; title: string }[];
  handleSessionClick: (session: CalendarSession) => void;
  viewMode: ViewMode;
  segmentWidth: number;
  bubbleHeight: number;
  containerHeight: number;
  chooseLane: (top: number) => number;
  laneHeights: number[];
}

export default function CalendarEvent({
  s,
  toY,
  visibleProjects,
  projects,
  handleSessionClick,
  viewMode,
  segmentWidth,
  bubbleHeight,
  containerHeight,
  chooseLane,
  laneHeights,
}: CalendarEventProps) {
  const start = new Date(s.start_time);
  const end = new Date(s.end_time);
  const top = toY(start);
  const bottom = toY(end);
  const height = Math.max(bottom - top, 4);
  const colors =
    visibleProjects.find((p) => p.id === String(s.project_id))?.colors ||
    getProjectColor(String(s.project_id));
  const centerY = top + height / 2;
  const bubbleTop = clamp(
    Math.round(centerY - bubbleHeight / 2),
    0,
    containerHeight - bubbleHeight
  );
  const laneIndex = chooseLane(bubbleTop);
  laneHeights[laneIndex] = bubbleTop + bubbleHeight;

  const projectTitle =
    projects.find((p) => p.id === s.project_id)?.title || "Projekt";

  return (
    <Box>
      <HoverCard openDelay={100} closeDelay={100} position="right" shadow="md">
        <HoverCard.Target>
          {/* Segment on the rail */}
          <Box
            onClick={() => handleSessionClick(s)}
            style={{
              position: "absolute",
              left: 0,
              top,
              width: segmentWidth,
              height,
              borderRadius: 5,
              background: colors.rail,
              cursor: "pointer",
              border: `1px solid ${colors.border}`,
            }}
          />
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Stack>
            <Text>{projectTitle}</Text>
            {s.memo && <Text>{s.memo}</Text>}
            <Text>
              {formatTimeSpan(new Date(s.start_time), new Date(s.end_time))}
            </Text>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
      {/* Pointer connecting bubble to the rail */}
      <Box style={{ cursor: "pointer" }} onClick={() => handleSessionClick(s)}>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCard.Target>
            <Box
              style={{
                position: "absolute",
                left: 13,
                top: bubbleTop + Math.round(bubbleHeight / 2) - 5,
                width: 10,
                height: 10,
                background: "var(--mantine-color-body)",
                transform: "rotate(45deg)",
                boxShadow: `-1px 1px 0 0 ${colors.border}`,
                zIndex: 1,
              }}
            />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Stack>
              <Text>{projectTitle}</Text>
              {s.memo && <Text>{s.memo}</Text>}
              <Text>
                {formatTimeSpan(new Date(s.start_time), new Date(s.end_time))}
              </Text>
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>
        {/* Bubble itself (compact, ellipsized content) */}
        <Box
          style={{
            position: "absolute",
            left: 16,
            top: bubbleTop,
            minHeight: bubbleHeight,
            maxWidth: 160,
            padding: "4px 6px",
            borderRadius: 8,
            background: "var(--mantine-color-body)",
            boxShadow: `inset 0 0 0 1px ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Box
            style={{
              width: 8,
              height: 8,
              zIndex: 2,
              borderRadius: 8,
              background: colors.rail,
              boxShadow: `0 0 0 1px ${colors.border}`,
              flex: "0 0 auto",
            }}
          />
          <Box style={{ minWidth: 0 }}>
            <Text
              size="xs"
              fw={600}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {projectTitle}
            </Text>
            {s.memo && (
              <Text
                size="xs"
                c="dimmed"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.memo}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
