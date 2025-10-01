import { ShotInput, Suggestion } from "../types";
import { ruleCoachShot } from "../engines/ruleEngine";

type EngineMode = "rule" | "ai";

export class CoachingService {
  constructor(private mode: EngineMode = "rule") {}

  async getSuggestions(input: ShotInput): Promise<Suggestion[]> {
    if (this.mode === "rule") {
      return ruleCoachShot(input);
    }
    // add ai engine here
    return [];
  }
}
