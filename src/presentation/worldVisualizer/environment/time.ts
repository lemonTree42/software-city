
export interface TimeObserver {
  updateTime(time: number, timeString: string): void;
}

export class Time {
  private readonly HOURS_PER_DAY: number = 24;
  private currentTime: number = 12;
  private timeChangeObservers: TimeObserver[] = [];

  public set(time: number): void {
    this.currentTime = time;
    this.notiyTimeObservers();
  }

  public increase(hours: number): void {
    this.currentTime = (((this.currentTime+hours)%this.HOURS_PER_DAY)+this.HOURS_PER_DAY)%this.HOURS_PER_DAY;
    this.notiyTimeObservers();
  }

  public decrease(hours: number): void {
    this.increase(-hours);
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public subscribeToTimeChange(observer: TimeObserver): void {
    this.timeChangeObservers.push(observer);
  }

  public notiyTimeObservers(): void {
    for (const observer of this.timeChangeObservers) {
      observer.updateTime(this.currentTime, this.toString());
    }
  }

  public toString(): string {
    const hours = Math.floor(this.currentTime);
    const minutes = Math.floor(60*(this.currentTime - hours));
    return `${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}:${
      minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}`;
  }
}
