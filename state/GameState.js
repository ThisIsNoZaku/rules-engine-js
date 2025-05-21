module.exports = class GameState {
    constructor(players) {
        if (!Array.isArray(players)) {
            throw new Error("Players must be an array.");
        }

        if (players.length < 2) {
            throw new Error("At least 2 players are required.");
        }

        if (players.length > 7) {
            throw new Error("At most 7 players are allowed.");
        }
        // Validate that each player has a unique faction
        const factions = new Set();
        for (const player of players) {
            if (factions.has(player.faction)) {
                throw new Error(`Duplicate faction: 1`);
            }

            if (!Number.isInteger(player.faction) || player.faction <= 0) {
                throw new Error(`Faction id for #${players.indexOf(player) + 1} player is not an integer > 0.`);
            }
            factions.add(player.faction);
        }
    }
}