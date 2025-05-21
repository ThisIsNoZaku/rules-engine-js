/**
 * Defines a set of rules that the engine can execute.
 *
 * Rules can be event-based or state-based.
 *
 * Event-based rules are applied when a matching trigger is fired by the rules engine.
 *
 * State-based rules are applied when the state of the engine matches the rule condition.
 * @type {RuleSet}
 */
module.exports = class RuleSet {
    constructor() {
        this.rules = {};
        this.eventRules = {};
        this.stateRules = {};
        this.triggers = {};
    }

    rulesForTrigger(trigger) {
        if (!this.eventRules[trigger]) {
            throw new Error(`No rules for trigger "${trigger}" found in rule set.`);
        }

        return this.eventRules[trigger];
    }

    /**
     * Add a new rule to the rule set.
     * A rule must have:
     * A unique 'id', of any truthy value.
     * Either a string 'trigger' OR a string 'condition'.
     * A string 'effect'.
     */
    addRule(ruleDefinition) {
        // TODO: Rule validation
        const {trigger, condition} = ruleDefinition;

        if(!this.triggers[trigger]) {
            this.triggers[trigger] = {
                id: "trigger",
                defaultTrigger: true
            };
        }

        if (!ruleDefinition.id) {
            throw new Error("Rule must have a truthy id.");
        }

        if (this.rules[ruleDefinition.id]) {
            throw new Error(`There is already a rule with unique id "${ruleDefinition.id}".`);
        }

        this.rules[ruleDefinition.id] = ruleDefinition;
        if (trigger) {
            this.eventRules[trigger] = (this.eventRules[trigger] || []).concat(ruleDefinition);
        } else if (condition) {
            this.stateRules[ruleDefinition.id] = ruleDefinition;
        } else {
            throw new Error("Rule must have either a trigger to be event-based or a condition to be state-based.");
        }
    }

    /**
     * Add a new trigger to the rule set.
     * @param triggerDefinition
     */
    addTrigger(triggerDefinition) {
        if(!triggerDefinition.id) {
            throw new Error("Trigger must have a truthy id.");
        }

        if (this.triggers[triggerDefinition.id] && !this.triggers[triggerDefinition.id].defaultTrigger) {
            throw new Error(`There is already a non-default trigger with unique id "${triggerDefinition.id}".`);
        }
        this.triggers[triggerDefinition.id] = triggerDefinition;
    }
}

const defaultTrigger = Symbol("defaultTrigger");