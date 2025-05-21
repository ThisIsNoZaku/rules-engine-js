const { program } = require('commander');
const Faction = require('./faction');

function resolveGame(configuration) {
    // Validate min players is at least 2
    if(configuration.minPlayers < 2) {
        throw new Error("Minimum players must be at least 2.");
    }
    // Validate max players is at most 7
    if(configuration.maxPlayers > 7) {
        throw new Error("Maximum players must be at most 7.");
    }
    // Validate allowed factions >= number of players
    if(configuration.allowedFactions.length < configuration.minPlayers) {
        throw new Error("Not enough factions for the number of players.");
    }
    // Validate factions instace of Faction class
    if(!configuration.allowedFactions.every(faction => faction instanceof Faction)) {
        throw new Error("All factions must be instances of the Faction class.");
    }
    // Validate allowed factions all exist
    // Setup players
    // Loop resolving actions until game is completed
}

function resolveRound(context) {
    // Generate resources at the start of the round.

    // Refresh discarded resources
}