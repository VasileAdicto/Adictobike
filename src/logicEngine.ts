import { BikeConfig, Rule, Operator, Step, Component } from './types';

/**
 * Evaluates if a component should be visible based on current selections and rules.
 */
export function isComponentVisible(
  component: Component,
  stepId: string,
  selections: Record<string, string>,
  rules: Rule[]
): boolean {
  // Default visibility
  let visible = true;

  for (const rule of rules) {
    const { condition, action } = rule;
    
    // Check if condition is met
    const selectedValue = selections[condition.stepId];
    const conditionMet = selectedValue === condition.value;

    if (conditionMet) {
      if (action.targetStepId === stepId) {
        // If the rule targets this specific component or the entire step
        if (!action.targetComponentId || action.targetComponentId === component.id) {
          if (action.type === Operator.HIDE) visible = false;
          if (action.type === Operator.SHOW) visible = true;
        }
      }
    }
  }

  return visible;
}

/**
 * Evaluates if a step should be skipped.
 */
export function isStepVisible(
  stepId: string,
  selections: Record<string, string>,
  rules: Rule[]
): boolean {
  let visible = true;

  for (const rule of rules) {
    const { condition, action } = rule;
    const selectedValue = selections[condition.stepId];
    const conditionMet = selectedValue === condition.value;

    if (conditionMet && action.targetStepId === stepId && !action.targetComponentId) {
      if (action.type === Operator.HIDE) visible = false;
      if (action.type === Operator.SHOW) visible = true;
    }
  }

  return visible;
}
