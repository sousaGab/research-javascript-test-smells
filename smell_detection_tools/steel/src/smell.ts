import { Location } from "./types";

export class Smell {
  readonly start: Location;
  frame: string = '';
  constructor(start: Location) {
    this.start = start;
  };
}
