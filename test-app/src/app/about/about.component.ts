import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <p>
      about works!
    </p>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}


