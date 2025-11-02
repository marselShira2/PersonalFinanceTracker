import { Component, OnInit } from '@angular/core';
import { JwtService  } from '../../../../../services/jwt/jwt.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  permission: string[] = [];
  constructor(private jwtService: JwtService) { }


  ngOnInit(): void {
    this.permission = this.jwtService.getUserPermissions();
  }

  //kontrollon nese useri ka te drejta te plota ose te pjesshme per x faqe
  hasPermission(permission: string): boolean {
    return this.permission.some(p => p.includes(permission));
  }

}
