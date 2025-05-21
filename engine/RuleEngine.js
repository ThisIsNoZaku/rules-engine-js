const vm = require('node:vm');
const RuleSet = require("../definitions/RuleSet.js");
module.exports = class RuleEngine {
    constructor(ruleSet) {
        // TODO: Validate rule set- all triggers have matching triggers, etc.
        if (!(ruleSet instanceof RuleSet)) {
            throw new Error("RuleSet must be an instance of RuleSet.");
        }
        this.ruleSet = ruleSet;
        this.scriptCache = {};
    }

    /**
     * Fire the given trigger using the provided context.
     */
    fire(trigger, state) {
        const triggerExists = !!this.ruleSet.triggers[trigger];
        if (!triggerExists) {
            throw new Error(`Trigger '${trigger}' not found in rule set.`);
        }

        const willExecute = !this.ruleSet.triggers[trigger].condition || this.executeScript(trigger.condition, {
            state,
            trigger
        });
        if (!willExecute) {
            throw new Error(`Cannot execute trigger '${trigger}', it's condition '${this.ruleSet.triggers[trigger].condition}' was not met.`)
        }
        // TODO: Validation of context shape.
        const rules = this.ruleSet.rulesForTrigger(trigger);
        for (let rule of rules) {
            this.executeRule(rule, {
                state,
                trigger,
                fire: trigger => this.fire(trigger, state)
            });
        }

        const stateRules = this.findRulesForState(state);
        for (let rule of Object.values(stateRules)) {
            const willExecute = this.executeScript(rule.condition, {state, trigger});
            if (willExecute) {
                this.executeRule(rule, {
                    state,
                    trigger,
                    fire: trigger => this.fire(trigger, state)
                });
            }
        }
        return state;
    }

    findRulesForState() {
        return this.ruleSet.stateRules;
    }

    executeRule(rule, context) {
        const {effect: scriptContent} = rule;
        try {
            this.executeScript(scriptContent, context);
        } catch (err) {
            throw new Error(`Error executing rule '${rule.id}': ${err.message}` +
                `\nScript: ${scriptContent}` +
                `\nContext: ${JSON.stringify(context, null, 2)}` +
                `\nError: ${err.stack}`);
        }
    }

    executeScript(scriptContent, context) {
        if (!scriptContent) {
            return;
        }
        if (!this.scriptCache[scriptContent]) {
            this.scriptCache[scriptContent] = new vm.Script(scriptContent);
        }

        const script = this.scriptCache[scriptContent];
        const sandbox = vm.createContext(context);
        return script.runInNewContext(sandbox);
    }
}