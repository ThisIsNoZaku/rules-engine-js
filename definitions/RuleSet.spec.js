const RuleSet = require("./RuleSet.js");

describe("RuleSet", () => {
    let ruleSet;
    beforeEach(() => {
        ruleSet = new RuleSet();
    });
    describe("rules", () => {
        it("throws if a rule with no id is added", () => {
            const ruleSet = new RuleSet();
            expect(() => ruleSet.addRule({})).toThrow("Rule must have a truthy id.");
        });
        it("throws if a rule with a duplicate id is added", () => {
            const ruleSet = new RuleSet();
            ruleSet.addRule({id: "rule1", condition: "true"});
            expect(() => ruleSet.addRule({id: "rule1"})).toThrow('There is already a rule with unique id "rule1".');
        });
        it("throws if a rule with no trigger or condition is added", () => {
            const ruleSet = new RuleSet();
            expect(() => ruleSet.addRule({id: "rule1"})).toThrow('Rule must have either a trigger to be event-based or a condition to be state-based.');
        });
    });
    describe("triggers", () => {
        it("throws if a trigger definition is missing an id", () => {
            expect(() => ruleSet.addTrigger({})).toThrow("Trigger must have a truthy id.");
        });
        it("adds if a trigger definition is valid", () => {
            expect(() => ruleSet.addTrigger({id: 1})).not.toThrow();
        });
        it("throws if a duplicate trigger is added", () => {
            ruleSet.addTrigger({id: 1});
            expect(() => ruleSet.addTrigger({id: 1})).toThrow('There is already a non-default trigger with unique id "1"');
        });
        it("throws if trying to get rules for a non-existent trigger", () => {
            expect(() => ruleSet.rulesForTrigger("nonExistentTrigger")).toThrow('No rules for trigger "nonExistentTrigger" found in rule set.');
        });
    });
});