import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // You can define data here to bind to the dashboard view
  welcomeMessage: string = 'Welcome to your Dashboard!';

  constructor() { }

  ngOnInit(): void {
    // This lifecycle hook runs when the component loads.
    console.log('DashboardComponent initialized');
  }

}
