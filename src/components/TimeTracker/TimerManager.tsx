// src/components/TimeTracker/TimerManager.tsx
import { TimerState } from "@/stores/timeTrackerStore";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import TimerInstance from "./TimerInstance";
import { Button } from "@mantine/core";

export default function TimerManager() {
  const { getAllTimers, addTimer } = useTimeTrackerManager();
  const { projectId, projectTitle, currency, salary, hourlyPayment, userId } =
    useTimeTracker();
  const timers = getAllTimers();

  const handleAddTimer = () => {
    addTimer({
      projectId: projectId,
      projectTitle: projectTitle,
      currency: currency,
      salary: salary,
      hourlyPayment: hourlyPayment,
      userId: userId,
      roundingInterval: 60,
      roundingMode: "up",
      state: TimerState.Stopped,
      activeSeconds: 0,
      pausedSeconds: 0,
      startTime: null,
      tempStartTime: null,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
      moneyEarned: "0.00",
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      pausedTime: "00:00",
    });
  };

  return (
    <div>
      <div>New Time Tracker</div>
      <Button onClick={handleAddTimer}>Add Timer</Button>
      {timers.map((timer) => (
        <TimerInstance key={timer.id} timerId={timer.id} />
      ))}
    </div>
  );
}
