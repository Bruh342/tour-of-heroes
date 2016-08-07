import { skillMapFromFactory, SkillMapOf, SkillType } from './skill.data';
import { Skill } from './skill';
import { GLOBALS } from './globals';
import { Klass } from './klass';
import { Perk, CLASS_PERKS } from './perk';
import { PlayerService } from './player.service';

export class Character {
    constructor(
        public name: string,
        // Starts from 1 (unlike skills)
        public level: number,
        public klass: Klass,
        public skills: SkillMapOf<Skill>,
        public perks: Perk[],
        // This is kind of lazy
        public game: PlayerService
    ) {
        this.totalSkillLevels = 0;
    }

    static newbornSkills(klass: Klass) {
        return skillMapFromFactory<Skill>(
            (s: SkillType) => {
                return new Skill(s, SkillType[s], 0, klass.aptitudes[s], 0);
            }
        );
    }

    static newborn(name: string, klass: Klass, game: PlayerService) {
        let perks: Perk[] = [];
        if (CLASS_PERKS[klass.name]) {
            perks.push(new CLASS_PERKS[klass.name]());
        } else {
            console.warn(`Couldn't find a perk for class ${klass.name}.`);
        }
        return new Character(name, 1, klass,
                             Character.newbornSkills(klass),
                             perks,
                             game
                            );
    }

    private totalSkillLevels: number;

    trainSkill(skill: SkillType, skillPoints: number) : number {
        let delta = this.skills[skill].train(skillPoints);
        if (delta > 0) {
            // Announce the new skill level
            this.game.skillSubject.next([skill, this.skills[skill].level]);

            let msg = "Increased " + SkillType[skill] + " to level " + this.skills[skill].level;
            //this.tickerService.logImportant(msg);
            let newTotal = this.totalSkillLevels + delta;
            let thresh = this.skillLevelsForNextLevel();
            while (newTotal >= thresh) {
                this.level++;
                //this.tickerService.logImportant(this.name + " reached level " + this.level + "!");
                newTotal -= thresh;
                thresh = this.skillLevelsForNextLevel();
                this.game.levelSubject.next(this.level);
            }
            this.totalSkillLevels = newTotal;
        }
        return delta;
    }

    skillLevelsForNextLevel() : number {
        return Character.skillLevelsForNextLevel(this.level);
    }

    static skillLevelsForNextLevel(level: number) : number {
        return GLOBALS.playerLevelIncrement * level;
    }

    percentProgress() : number {
        return 100 * (this.totalSkillLevels / this.skillLevelsForNextLevel());
    }

}
