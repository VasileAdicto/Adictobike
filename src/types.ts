export enum Operator {
  IF = 'IF',
  THEN = 'THEN',
  HIDE = 'HIDE',
  SHOW = 'SHOW',
  AND = 'AND',
  EQUALS = 'EQUALS',
}

export interface Rule {
  id: string;
  condition: {
    stepId: string;
    operator: Operator.EQUALS;
    value: string; // componentId
  };
  action: {
    type: Operator.HIDE | Operator.SHOW;
    targetStepId: string;
    targetComponentId?: string; // If null, hides/shows entire step
  };
}

export interface Component {
  id: string;
  name: string;
  brand: string;
  price: number;
  weight: number;
  imageUrl: string;
  zIndex: number;
}

export interface Step {
  id: string;
  title: string;
  options: Component[];
}

export interface BikeConfig {
  selections: Record<string, string>; // stepId -> componentId
  totalPrice: number;
  totalWeight: number;
}
