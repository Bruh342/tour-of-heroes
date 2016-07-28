import { Component, Input } from '@angular/core';

import { GameZone } from './zone';

@Component({
    selector: 'zone',
    template: `
    <h3>{{zone.name}}</h3>
    <p>{{zone.description}}</p>
    <button>{{zone.action}}</button>
    `
})

export class ZoneComponent {

    @Input() zone : GameZone;

}
