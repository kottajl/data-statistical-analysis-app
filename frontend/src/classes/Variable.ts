export enum VariableType {
    CATEGORICAL = "C",
    NUMERICAL = "N"
}

export class Variable {
    name: string;
    type: VariableType;
    values: (string | undefined)[] | (number | undefined)[];

    constructor(name: string, type: VariableType, values: (string | undefined)[] | (number | undefined)[]) {
        this.name = name;
        this.type = type;
        this.values = values;
    }
}

export function getColNameFromVarName(_var: string): string 
{
  return "col_" + _var;
}

export{}