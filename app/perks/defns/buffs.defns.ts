import { AbstractBuff } from '../perk';
import { di_tokens } from '../../shared/di-tokens';
import { IActionService } from '../../actions/action.service.interface';

export namespace BUFFS {

// TODO: YOUAREHERE
export class GoingBerserk extends AbstractBuff {
    diTokens = [di_tokens.actionservice];
    name = "Berserk";
    private speedup = 2.0;
    description = "u mad";
    duration = 20

    onCast(AS: IActionService) {
        console.log("Applying berserking buff");
        AS.actionSpeedMultiplier += this.speedup;
    }

    cleanUp(AS: IActionService) {
        console.log("Removing berserking buff");
        AS.actionSpeedMultiplier -= this.speedup;
    }
}

}
