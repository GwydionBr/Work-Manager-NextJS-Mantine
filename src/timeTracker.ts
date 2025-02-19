
enum TimerState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

class TimeTracker {
  private timer: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private activeTime: number = 0;
  private state: TimerState = TimerState.Stopped;

  public start() {
    if (this.state === TimerState.Running) {
      return;
    }

    if (this.state === TimerState.Paused) {
      this.pausedTime += Date.now() - this.startTime;
    }

    this.startTime = Date.now();
    this.state = TimerState.Running;

    this.timer = setInterval(() => {
      this.activeTime = Date.now() - this.startTime - this.pausedTime;
    }, 1000);
  }

  public pause() {
    if (this.state !== TimerState.Running) {
      return;
    }

    clearInterval(this.timer as NodeJS.Timeout);
    this.timer = null;
    this.state = TimerState.Paused;
  }

  public stop() {
    clearInterval(this.timer as NodeJS.Timeout);
    this.timer = null;
    this.state = TimerState.Stopped;
    this.activeTime = 0;
    this.pausedTime = 0;
  }

  public getActiveTime() {
    return this.activeTime;
  }

  public getState() {
    return this.state;
  }
}

const mainTimeTracker = new TimeTracker();