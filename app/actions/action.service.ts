import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { IActionService } from './action.service.interface';
import { GLOBALS } from '../globals';
import { PlayerService } from '../player/player.service';
import { StatsService } from '../stats/stats.service';
import { Zone,
    ActionOutcome,
    LiveZoneAction,
    ZoneAction,
    ZoneActionDescription,
    PlayerOutcome,
    ActionEvent,
    ActionEffect,
    SkillMap, getTruthySkills
 } from '../core/index';
import { RealLiveZoneAction } from './reallivezoneaction';

export interface PostActionInfo {
    outcome: ActionOutcome;
    nextAction: LiveZoneAction;
}

@Injectable()
export class ActionService implements IActionService {

    public currentAction: RealLiveZoneAction;
    public activeZone: Zone;
    // Replays the one last action
    public postActionSubject: Subject<PostActionInfo> =
        new ReplaySubject<PostActionInfo>(1);

    private _actionSpeedMultiplier = 1.0;

    // Experimental
    actionEffectSubject: Subject<ActionEffect> = new Subject<ActionEffect>();

    constructor(
        private PS: PlayerService,
        private stats: StatsService
    ) { }

    get actionSpeedMultiplier(): number {
        return this._actionSpeedMultiplier;
    }
    set actionSpeedMultiplier(newValue: number) {
        console.assert(newValue > 0 && this._actionSpeedMultiplier > 0);
        let speedup = newValue / this._actionSpeedMultiplier;
        if (this.currentAction) {
            this.currentAction.adjustRemainingTime(speedup);
        }
        this._actionSpeedMultiplier = newValue;
    }

    // ------------------- ACTION BOOKKEEPING --------------------------

    /** Immediately terminate any action running in this zone, and stop
    looping actions for that zone. **/
    stopActionLoop(zone: Zone) {
        // TODO: would be cool to define a decorator that says "this is
        // a no-op if there's no actions going on right now"
        if (!this.activeZone || this.activeZone != zone) { return; }
        this.activeZone = undefined;
        this.currentAction.kill();
        this.currentAction = undefined;
    }
    stopAllActions() {
        if (this.activeZone) {
            this.stopActionLoop(this.activeZone);
        }
    }

    /** Return the currently running action in the given zone, if any **/
    ongoingActionForZone(zone: Zone) : LiveZoneAction {
        if (this.activeZone && zone.zid == this.activeZone.zid) {
            return this.currentAction;
        }
        return undefined;
    }

    startActionLoop(zone: Zone) : LiveZoneAction {
        this.stopAllActions();
        this.activeZone = zone;
        this.currentAction = this.runActionLoop();
        return this.currentAction;
    }

    private runActionLoop() : RealLiveZoneAction {
        let zoneaction: ZoneAction = this.chooseActionType(this.activeZone);
        let desc: ZoneActionDescription = zoneaction.chooseDescription();
        let delay = this.getDelay(zoneaction);
        let cb = () => {
            let outcome = this.getOutcome(zoneaction, desc.past); // bleh
            let nextAction = this.runActionLoop();
            let post = { outcome: outcome, nextAction: nextAction };
            this.postActionSubject.next(post);
            this.stats.actionTaken(this.activeZone.name);
        };
        let action: RealLiveZoneAction = new RealLiveZoneAction(
            desc.present, delay, cb, this.activeZone.zid);
        this.currentAction = action;
        return action;
    }

    // ------------------- ACTION MECHANICS --------------------------

    private getDelay(action: ZoneAction): number {
        let delay = action.delay(this.PS.getSkillLevels());
        let buffedDelay = delay / this.actionSpeedMultiplier;
        if (delay != buffedDelay) {
            console.log(`Buffed: ${buffedDelay}`);
        }
        return buffedDelay;
    }

    private getOutcome(action: ZoneAction, mainDesc: string): ActionOutcome {
        let mainEffect: ActionEffect = { skillPoints: action.skillDeltas };
        this.actionEffectSubject.next(mainEffect);
        // TODO: Bad separation of concerns. Application should happen here
        // (calling PS for skill gains, calling PerkService for buffs, invService
        // for items, etc.)
        let mainOutcome: PlayerOutcome = this.PS.applyEffect(mainEffect);
        let mainEvent: ActionEvent = {description: mainDesc, outcome: mainOutcome};
        return {main: mainEvent, secondary:[]};
    }

    // TODO: Used to be a method of zone, and now feels kind of weird here
    private chooseActionType(zone: Zone) : ZoneAction {
        let dice: number = Math.random();
        let sofar = 0;
        for (let action of zone.actions) {
            sofar += action.weight;
            if (sofar > dice) {
                return action;
            }
        }
        console.assert(false, "Shouldnt have reached here.");
    }

}
