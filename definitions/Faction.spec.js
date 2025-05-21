const Faction = require('./Faction.js');
describe("Faction", () => {
    it("can be created with a valid id", () => {
        const faction = new Faction(1);
        expect(faction.id).toBe(1);
    });
    describe('validation', () => {
        it("should throw an error when creating a faction with an invalid id", () => {
            expect(() => new Faction(-1)).toThrow("Faction id must be a positive integer.");
            expect(() => new Faction(0)).toThrow("Faction id must be a positive integer.");
            expect(() => new Faction("a")).toThrow("Faction id must be a positive integer.");
        });

        it("should throw an error when creating a faction with a non-integer id", () => {
            expect(() => new Faction(1.5)).toThrow("Faction id must be a positive integer.");
        });
    });
});