import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';


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

  chattersSubscription: Subscription;
  // chattersSubscription: Subscription;
  // chattersRemoveSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private router: Router) {
    this.chattersSubscription = this.chatService.getUsers().subscribe(chatters => {
      if (chatters) {
        this.chatters = chatters;
      }
    });

  }

  ngOnInit() {

  }

  isScreenSmall() {
    return this.mediaMatcher.matches;
  }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {
      if (this.isScreenSmall()) {
        console.log(this.sideNav);
        this.sideNav.close();
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.chattersSubscription.unsubscribe();
  }

}
