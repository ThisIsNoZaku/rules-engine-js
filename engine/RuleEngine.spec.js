const RuleEngine = require('./RuleEngine');
const RuleSet = require("../definitions/RuleSet.js");

describe("RuleEngine", () => {
    describe("constructor", () => {
        it("must receive a ruleset object", () => {
            expect(() => new RuleEngine(new RuleSet())).not.toThrow();
        });
        it("throws if the ruleset is null", () => {
            expect(() => new RuleEngine(null)).toThrow("RuleSet must be an instance of RuleSet.");
        })
        it("throws if the ruleset is not an object", () => {
            expect(() => new RuleEngine("not an object")).toThrow("RuleSet must be an instance of RuleSet.");
        })
        it("throws if the ruleset is not an instance of RuleSet", () => {
            expect(() => new RuleEngine({})).toThrow("RuleSet must be an instance of RuleSet.");
        });
    });
    describe("triggers", () => {
        describe("validation", () => {
            let engine;
            beforeEach(() => {
                const rules = new RuleSet();
                rules.addRule({id: "addTwo", trigger: "addTwo", effect: "state.c = state.a + state.b"});
                engine = new RuleEngine(rules);
            })
            it("throw when a missing trigger is fired", () => {
                expect(() => {
                    engine.fire("missingTrigger")
                }).toThrow();
            });
            it("executes a script when a trigger is fired", () => {
                const state = {
                    a: 1,
                    b: 1
                };
                engine.fire("addTwo", state);
                expect(state.c).toEqual(2);
            });
        });
        it("creates a default trigger when a rule is added", () => {
            const rules = new RuleSet();
            expect(rules.triggers[1]).toBeUndefined();
            rules.addRule({
                id: 1,
                trigger: 1,
            });
            expect(rules.triggers[1]).not.toBeUndefined();
        });
        it("overrides a default trigger when adding a new one", () => {
            const rules = new RuleSet();
            rules.addRule({
                id: 1,
                trigger: 1,
            });
            rules.addTrigger({
                id: 1,
                someProperty: "someValue"
            });
            expect(rules.triggers[1].someProperty).toEqual("someValue");
        });
        it("throws if the trigger is not allowed", () => {
            const rules = new RuleSet();
            rules.addRule({
                id: 1,
                trigger: 1,
            });
            rules.addTrigger({
                id: 1,
                condition: "condition"
            });
            const engine = new RuleEngine(rules);

            expect(() => {
                engine.fire(1, {});
            }).toThrow("Cannot execute trigger '1', it's condition 'condition' was not met.");
        })
        it("throws if too many recursive triggers are called", () => {
            const rules = new RuleSet();
            rules.addRule({
                id: 1,
                trigger: 1,
                effect: "fire(1)"
            });
            const engine = new RuleEngine(rules);

            expect(() => {
                engine.fire(1, {});
            }).toThrow("Exceeded maximum recursion depth (10): " + new Array(11).fill(1).join(" -> "));
        });
    });
    describe("rules", () => {
        describe("event-based", () => {
            let engine;
            beforeEach(() => {
                const rules = new RuleSet();
                rules.addRule({
                    id: "rule",
                    trigger: "trigger",
                    effect: "state.triggered = true"
                });
                engine = new RuleEngine(rules);
            })
            it("can be applied when a matching trigger is fired", () => {
                const state = {};
                engine.fire("trigger", state);
                expect(state.triggered).toBeTruthy();
            });
            it("can fire triggers in their effect", () => {
                const rules = new RuleSet();
                rules.addRule({
                    id: "first",
                    trigger: "first",
                    effect: "fire('second')"
                });
                rules.addRule({
                    id: "second",
                    trigger: "second",
                    effect: "state.triggered = true"
                });
                const state = {};
                const engine = new RuleEngine(rules);
                engine.fire("first", state);
                expect(state.triggered).toBeTruthy();
            });
        });
        describe("state-based", () => {
            it("execute when the state matches the rule condition after an event", () => {
                const rules = new RuleSet();
                rules.addRule({
                    id: "dummy",
                    trigger: "dummy",
                    effect: ""
                })
                rules.addRule({
                    id: "stateRule",
                    condition: "state.a > 5",
                    effect: "state.triggered = true"
                });
                let state = {
                    a: 10
                };
                const engine = new RuleEngine(rules);
                state = engine.fire("dummy", state);
                expect(state.triggered).toBeTruthy();
            });
            it("does not execute when the state does not match the rule condition after an event", () => {
                const rules = new RuleSet();
                rules.addRule({
                    id: "dummy",
                    trigger: "dummy",
                    effect: ""
                })
                rules.addRule({
                    id: "stateRule",
                    condition: "state.a < 5",
                    effect: "state.triggered = true"
                });
                let state = {
                    a: 10
                };
                const engine = new RuleEngine(rules);
                state = engine.fire("dummy", state);
                expect(state.triggered).toBeFalsy();
            })
            it("can fire triggers in their effect", () => {
                const rules = new RuleSet();
                rules.addRule({
                    id: "first",
                    trigger: "first",
                    effect: "state.first = true"
                });
                rules.addRule({
                    id: "second",
                    condition: "state.first",
                    effect: "fire('third')"
                });
                rules.addRule({
                    id: "third",
                    trigger: "third",
                    effect: "state.triggered = true; state.first = false"
                });
                const state = {};
                const engine = new RuleEngine(rules);
                engine.fire("first", state);
                expect(state.triggered).toBeTruthy();
            });
            it("throws if too many recursive triggers are called", () => {
                const rules = new RuleSet();

                rules.addRule({
                    id: 1,
                    trigger: 1
                });

                rules.addRule({
                    id: 2,
                    condition: "true",
                    effect: "fire(1)"
                });
                const engine = new RuleEngine(rules);

                expect(() => {
                    engine.fire(1, {});
                }).toThrow("Exceeded maximum recursion depth (10): " + new Array(11).fill(1).join(" -> "));
            });
        });
    });
    describe("scripts", () => {
        it("uses cached scripts", () => {
            const rules = new RuleSet();
            rules.addRule({
                id: "1",
                trigger: "trigger",
                effect: "state.triggered = !state.triggered"
            })
            const state = {};
            const engine = new RuleEngine(rules);
            expect(state.triggered).toBeFalsy();
            engine.fire("trigger", state);
            expect(state.triggered).toBeTruthy();
            engine.fire("trigger", state);
            expect(state.triggered).toBeFalsy();
        });
        it("throw on error", () => {
            const rules = new RuleSet();
            rules.addRule({
                id: "1",
                trigger: "1",
                effect: "true = helloWorld"
            })
            const engine = new RuleEngine(rules);
            expect(() => {
                engine.fire(1)
            }).toThrow(`Error executing rule '1': Invalid left-hand side in assignment` +
            `\nScript: true = helloWorld` +
            `\nContext: {` +
            `\n  "trigger": 1` +
            `\n}`);

        });
    });
});