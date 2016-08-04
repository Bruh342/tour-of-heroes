import { Input, Component, OnInit } from '@angular/core';

import { TickerService } from './ticker.service';

import { Zone } from './zone';
import { ZoneAction } from './zoneaction';
import { ZoneComponent } from './zone.component';
import { ZONES } from './zones.data';

import { Skill, SkillType } from './skill';

import { GLOBALS } from './globals';
import { Player } from './player';
import { PlayerService } from './player.service';

@Component({
    selector: 'zones',
    directives: [ZoneComponent],
    template: `
    <div class="zones">
        <div *ngFor="let zone of zones">
            <zone 
                [zone]="zone" 
                >
            </zone>
        </div>
    </div>
    `
})

export class ZonesComponent implements OnInit {
    @Input() superzone : string;
    get zones() : Zone[] {
        return ZONES[this.superzone];
    }
    player : Player;

    constructor(private playerService: PlayerService,
        private tickerService: TickerService
    ) {
        this.player = playerService.player;
    }
    
    ngOnInit() {
    }

}

