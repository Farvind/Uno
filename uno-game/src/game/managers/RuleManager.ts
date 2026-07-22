import type { Card } from "../models/Card";

export default class RuleManager {

    public canPlay(
        played: Card,
        top: Card,
        currentColor: string
    ): boolean {

        // Wild cards always playable
        if (played.type === "Wild")
            return true;

        if (played.type === "Wild4")
            return true;

        // Same color (tracks the active color, not just the top card's
        // original color, so this stays correct after a Wild is played)
        if (played.color === currentColor)
            return true;

        // Same action (Skip-on-Skip, Reverse-on-Reverse, Draw2-on-Draw2).
        // Deliberately excludes "Number" here - two number cards being the
        // same *type* doesn't mean they're the same *value*, that's checked
        // separately below.
        if (played.type === top.type && played.type !== "Number")
            return true;

        // Same number
        if (
            played.type === "Number" &&
            top.type === "Number" &&
            played.value === top.value
        )
            return true;

        return false;

    }

}