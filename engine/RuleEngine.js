const vm = require('node:vm');
const RuleSet = require("../definitions/RuleSet.js");
const maximumRecursionDepth = 10;
module.exports = class RuleEngine {
    constructor(ruleSet) {
        // TODO: Validate rule set- all triggers have matching triggers, etc.
        if (!(ruleSet instanceof RuleSet)) {
            throw new Error("RuleSet must be an instance of RuleSet.");
        }
        this.ruleSet = ruleSet;
        this.scriptCache = {};
        this.triggerStack = [];
        this.recursionDepth = 0;
    }

    /**
     * Fire the given trigger using the provided context.
     */
    fire(trigger, state) {
        this.triggerStack.push(trigger);
        this.recursionDepth++;
        if (this.triggerStack.length > maximumRecursionDepth) {
            throw new TriggerRecursionError();
        }

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
            const result = this.executeRule(rule, {
                state,
                trigger,
                fire: trigger => this.fire(trigger, state)
            });
            if (result === recursionError) {
                this.recursionDepth--;
                if (this.recursionDepth > 1) {
                    return recursionError;
                } else {
                    throw new Error(`Exceeded maximum recursion depth (${maximumRecursionDepth}): ${this.triggerStack.join(" -> ")}`);
                }
            }
        }

        const stateRules = this.findRulesForState(state);
        for (let rule of Object.values(stateRules)) {
            const willExecute = this.executeScript(rule.condition, {state, trigger});
            if (willExecute) {
                const result = this.executeRule(rule, {
                    state,
                    trigger,
                    fire: trigger => this.fire(trigger, state)
                });
                if (result === recursionError) {
                    this.recursionDepth--;
                    if (this.recursionDepth > 1) {
                        return recursionError;
                    } else {
                        throw new Error(`Exceeded maximum recursion depth (20): ${this.triggerStack.join(" -> ")}`);
                    }
                }
            }
        }
        this.recursionDepth--;
        this.triggerStack.pop();
        return state;
    }

    findRulesForState() {
        return this.ruleSet.stateRules;
    }

    executeRule(rule, context) {
        const {effect: scriptContent} = rule;
        try {
            return this.executeScript(scriptContent, context);
        } catch (err) {
            if (err instanceof TriggerRecursionError) {
                return recursionError;
            }

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

function TriggerRecursionError(message) {
    this.name = "RecursionError";
    this.message = message;
}

const recursionError = Symbol("recursionError");