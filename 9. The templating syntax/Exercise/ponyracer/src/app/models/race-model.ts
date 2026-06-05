import { PonyModel } from './pony-model';

export interface RaceModel {
  id: number;
  name: string;
  // Exercise 4: create a TypeScript interface in a new folder models (inside app).
  // Define this interface RaceModel in a file named race-model.ts. It should have two fields id,
  // of type number, and name, of type string.

  ponies: Array<PonyModel>;
  startInstant: string;
  // Exercise 5: create a pony-model.ts interface with fields id of type number and two fields of
  // type string: name and color. And Enrich/update the race-model.ts interface so that RaceModel
  // has an array of PonyModel named ponies and a field startInstant of type string.
}
