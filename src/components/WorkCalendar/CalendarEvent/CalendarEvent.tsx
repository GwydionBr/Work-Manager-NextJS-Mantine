import { Box, Stack, Text, HoverCard } from "@mantine/core";
import { CalendarSession, clamp, getProjectColor } from "../calendarUtils";
import { formatTimeSpan } from "@/utils/workHelperFunctions";
import { ViewMode } from "@/types/workCalendar.types";

interface CalendarEventProps {
  itemsForRender: CalendarSession[];
  columnWidth: number;
  hourHeight: number;
  startHour: number;
  endHour: number;
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
}

export default function CalendarEvent({
  itemsForRender,
  columnWidth,
  hourHeight,
  startHour,
  endHour,
  toY,
  visibleProjects,
  projects,
  handleSessionClick,
  viewMode,
}: CalendarEventProps) {
  const laneHeights: number[] = [];
  const availableWidth = Math.max((columnWidth || 220) - (16 + 12) - 8, 100);
  const laneWidth = Math.min(160, availableWidth);
  const bubbleHeight = 26;
  const railLeft = 3;
  const segmentWidth = 10;
  const containerHeight = hourHeight * (endHour - startHour);
  const chooseLane = (top: number) => {
    for (let i = 0; i < laneHeights.length; i++) {
      if (laneHeights[i] + 4 <= top) {
        return i;
      }
    }
    laneHeights.push(0);
    return laneHeights.length - 1;
  };
  return itemsForRender.map((s) => {
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    const top = toY(start);
    const bottom = toY(end);
    const height = Math.max(bottom - top, 4);
    const colors =
      visibleProjects.find((p) => p.id === String(s.project_id))?.colors ||
      getProjectColor(String(s.project_id));
    const segmentLeft = railLeft - Math.floor(segmentWidth / 2) + 2;
    const centerY = top + height / 2;
    const bubbleTop = clamp(
      Math.round(centerY - bubbleHeight / 2),
      0,
      containerHeight - bubbleHeight
    );
    const laneIndex = chooseLane(bubbleTop);
    const bubbleLeft =
      railLeft + 12 + laneIndex * (viewMode === "week" ? 30 : laneWidth);
    laneHeights[laneIndex] = bubbleTop + bubbleHeight;

    const projectTitle =
      projects.find((p) => p.id === s.project_id)?.title || "Projekt";

    return (
      <Box key={s.id}>
        <HoverCard
          openDelay={100}
          closeDelay={100}
          position="right"
          shadow="md"
        >
          <HoverCard.Target>
            {/* Segment on the rail */}
            <Box
              onClick={() => handleSessionClick(s)}
              style={{
                position: "absolute",
                left: segmentLeft,
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
        <Box
          style={{ cursor: "pointer" }}
          onClick={() => handleSessionClick(s)}
        >
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCard.Target>
              <Box
                style={{
                  position: "absolute",
                  left: bubbleLeft - 3,
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
              left: bubbleLeft,
              top: bubbleTop,
              minHeight: bubbleHeight,
              maxWidth: laneWidth - 10,
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
  });
}
