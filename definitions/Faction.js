module.exports = class Faction {
    constructor(id) {
        if(!Number.isInteger(id) || id <= 0) {
            throw new Error("Faction id must be a positive integer.");
        }
        this.id = id;
    }
}