export class Position {
  constructor(
        public X: number,
        public Y: number) {
  }

  public distanceTo(other: Position): number {
    return Math.sqrt(Math.pow(this.X - other.X, 2) + Math.pow(this.Y - other.Y, 2));
  }
}
