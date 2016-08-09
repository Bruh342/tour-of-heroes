import { SkillType } from './skilltype.enum';

export type SkillMapOf<T> = Array<T>;
export type SkillMap = SkillMapOf<number>;

export function uniformSkillMap<T>(repeatedValue : T) : SkillMapOf<T> {
    return skillMapFromFactory<T>( (s:number) => { return repeatedValue; } );
}

export function mostlyUniformSkillMap<T>(repeatedValue: T, exceptions: Object) {
    let tees : T[] = new Array<T>(SkillType.MAX);
    for (let skillId=0; skillId < SkillType.MAX; skillId++) {
        if (exceptions.hasOwnProperty(skillId)) {
            tees[skillId] = exceptions[skillId];
        } else {
            tees[skillId] = repeatedValue;
        }
    }
    return tees;
}

export let JSONtoSkillMap: (Object) => SkillMap = JSONtoSkillMapFactory<number>();

export function dictToSkillMap(dict: {[skillName: string]: number}) : SkillMap {
    let sm : SkillMap = new Array<number>(SkillType.MAX);
    for (let skillName in dict) {
        let idx:number = SkillType[skillName];
        sm[idx] = dict[skillName];
    }
    return sm;
}

export function skillMapFromFactory<T>(initFactory: (number) => T) : SkillMapOf<T> {
    let tees : T[] = new Array<T>(SkillType.MAX);
    for (let skillId=0; skillId < SkillType.MAX; skillId++) {
        tees[skillId] = initFactory(skillId);
    }
    return tees;
}


// ------------ Private --------------------

function JSONtoSkillMapFactory<T>() : (Object) => SkillMapOf<T> {
    return (j: Object) => {
    let tees : T[] = new Array<T>(SkillType.MAX);
    for (let skillId=0; skillId < SkillType.MAX; skillId++) {
        if (j.hasOwnProperty(skillId)) {
            tees[skillId] = j[skillId];
        } else {
            // tees[skillId] = undefined; // probably redundant?
        }
    }
    return tees;
    }
}
function JSONtoSkillMapOf<T>(j: Object) : SkillMapOf<T> {
    return JSONtoSkillMapFactory<T>()(j);
}
