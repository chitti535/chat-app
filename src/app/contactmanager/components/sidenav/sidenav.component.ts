import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, AfterViewInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ThrowStmt } from '@angular/compiler';


const SMALL_WIDTH_BREAKPOINT = 720;
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidenav', { static: false }) sideNav: MatSidenav;

  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`);
  chatters: User[] = [];
  activeUser: User;

  chattersSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private router: Router) {
    this.chattersSubscription = this.chatService.getUsers().subscribe(chatters => {
      if (chatters) {
        this.chatters = chatters;
      }
    });

    this.chatService.getActiveUser().subscribe(activeUser => {
      this.activeUser = activeUser;
      if (activeUser) {
        if (this.isScreenSmall()) {
          console.log(this.sideNav);
          this.sideNav.close();
        }
      }
    });

  }

  ngOnInit() {
    // if (this.activeUser == null && (this.chatters != null && this.chatters.length > 0)) {
    //   this.activeUser = this.chatters[0];
    //   MatSidenav[0].click();
    // }
  }

  isScreenSmall() {
    return this.mediaMatcher.matches;
  }

  onUserSelected(user: User) {
    console.log('user cliecked: ' + user.name);
    this.chatService.setActiveUser(user);
  }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {

    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.chattersSubscription.unsubscribe();
  }

}
