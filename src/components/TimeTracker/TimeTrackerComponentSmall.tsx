// "use client";

// import { useTimeTracker } from "@/stores/timeTrackerStore";

// import { TimerState } from "@/stores/timeTrackerStore";

// import {
//   Stack,
//   Text,
//   Collapse,
//   Divider,
//   LoadingOverlay,
//   Card,
// } from "@mantine/core";

// import StartActionIcon from "./TimeTrackerActionIcons/StartActionIcons";
// import PauseActionIcon from "./TimeTrackerActionIcons/PauseActionIcon";
// import ResumeActionIcon from "./TimeTrackerActionIcons/ResumeActionIcon";
// import StopActionIcon from "./TimeTrackerActionIcons/StopActionIcon";
// import CancelActionIcon from "./TimeTrackerActionIcons/CancelActionIcon";
// import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
// import TimeTrackerInfoHoverCard from "./TimeTrackerInfoHoverCard";
// import ModifyTimeTrackerModal from "./ModifyTimeTracker/ModifyTimeTrackerModal";

// interface TimeTrackerComponentSmallProps {
//   showSmall: boolean;
//   isSubmitting: boolean;
//   setShowSmall: (showSmall: boolean) => void;
//   submitTimer: () => void;
//   getStatusColor: () => string;
// }

// export default function TimeTrackerComponentSmall({
//   showSmall,
//   isSubmitting,
//   setShowSmall,
//   getStatusColor,
//   submitTimer,
// }: TimeTrackerComponentSmallProps) {
//   const {
//     roundedActiveTime,
//     state,
//     activeTime,
//     pausedTime,
//     startTimer,
//     pauseTimer,
//     resumeTimer,
//     cancelTimer,
//   } = useTimeTracker();

//   return (
//     <Stack w={50} align="center" justify="center" gap="xs">
//       <TimeTrackerActionIcon
//         action={() => setShowSmall(!showSmall)}
//         label={showSmall ? "hide Timer" : "show Timer"}
//         state={state}
//         getStatusColor={getStatusColor}
//       />
//       <Collapse in={showSmall} transitionDuration={400}>
//         <Stack gap="xs" align="center" justify="center" pos="relative">
//           <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
//           <TimeTrackerInfoHoverCard />
//           <ModifyTimeTrackerModal />
//           <Divider />
//           <Card
//             w={47}
//             shadow="sm"
//             padding={0}
//             py={8}
//             mr={1}
//             radius="md"
//             withBorder
//             style={{
//               borderColor:
//                 state === TimerState.Running
//                   ? "var(--mantine-color-blue-6)"
//                   : "",
//             }}
//           >
//             <Text fz={11} c="dimmed" ta="center">
//               Active
//             </Text>
//             <Text fz={11} fw={state === "running" ? 700 : 400} ta="center">
//               {activeTime}
//             </Text>
//             <Text fz={11} c="dimmed" ta="center">
//               {roundedActiveTime}
//             </Text>
//           </Card>
//           <Card
//             w={47}
//             shadow="sm"
//             padding={0}
//             py={8}
//             mr={1}
//             radius="md"
//             withBorder
//             style={{
//               borderColor:
//                 state === TimerState.Paused
//                   ? "var(--mantine-color-orange-6)"
//                   : "",
//             }}
//           >
//             <Text fz={11} c="dimmed" ta="center">
//               Paused
//             </Text>
//             <Text fz={11} fw={state === "paused" ? 700 : 400} ta="center">
//               {pausedTime}
//             </Text>
//           </Card>
//           {state === "stopped" && <StartActionIcon startTimer={startTimer} />}
//           {state === "running" && (
//             <PauseActionIcon pauseTimer={pauseTimer} disabled={isSubmitting} />
//           )}
//           {state === "paused" && (
//             <ResumeActionIcon
//               resumeTimer={resumeTimer}
//               disabled={isSubmitting}
//             />
//           )}
//           <Collapse
//             in={state === "running" || state === "paused"}
//             transitionDuration={400}
//           >
//             <Stack gap="xs" align="center" justify="center">
//               <StopActionIcon stopTimer={submitTimer} disabled={isSubmitting} />
//               <CancelActionIcon
//                 cancelTimer={cancelTimer}
//                 disabled={isSubmitting}
//               />
//             </Stack>
//           </Collapse>
//         </Stack>
//       </Collapse>
//     </Stack>
//   );
// }
