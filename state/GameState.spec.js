const GameState = require("./GameState");

describe("GameState", () => {
    describe('players parameter', function () {
        it("throws an error if players have duplicate factions", () => {
            const players = [
                {faction: 1},
                {faction: 1},
            ];

            expect(() => new GameState(players)).toThrow("Duplicate faction: 1");
        });
        it("throws an error if any player does not have a faction", () => {
            const players = [
                {faction: 1},
                {},
            ];

            expect(() => new GameState(players)).toThrow("Faction id for #2 player is not an integer > 0.");
        });
        it("throws an error if players is less than 2", () => {
            const players = [
                {faction: 1},
            ];

            expect(() => new GameState(players)).toThrow("At least 2 players are required.");
        });
        it("throws an error if players is more than 7", () => {
            const players = [
                {faction: 1},
                {faction: 2},
                {faction: 3},
                {faction: 4},
                {faction: 5},
                {faction: 6},
                {faction: 7},
                {faction: 8},
            ];

            expect(() => new GameState(players)).toThrow("At most 7 players are allowed.");
        });
        it("throws an error if players is not an array", () => {
            const players = {};

            expect(() => new GameState(players)).toThrow("Players must be an array.");
        });
    });
});