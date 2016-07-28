import { Component, Input } from '@angular/core';

import { Zone } from './zone';

@Component({
    selector: 'zone',
    template: `
    <h3>{{zone.name}} {{active ? "(ACTIVE)" : ""}}</h3>
    <p>{{zone.description}}</p>
    <button>{{zone.action}}</button>
    `
})

export class ZoneComponent {

    @Input() zone : Zone;
    @Input() active : boolean;

}
