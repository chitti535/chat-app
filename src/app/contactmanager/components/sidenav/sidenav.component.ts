import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';

const SMALL_WIDTH_BREAKPOINT = 720;
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {

private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`);
  chatters: any[] = [];

  chattersSubscription: Subscription;
  chattersRemoveSubscription: Subscription;

  constructor(private chatService: ChatService) {
    this.chattersSubscription = this.chatService.addChatter().subscribe(chatter => {
      if (chatter) {
        this.chatters.push(chatter.name);
      }
    });

    this.chattersRemoveSubscription = this.chatService.removeChatter().subscribe(chatter => {
      if (chatter) {
        const index = this.chatters.indexOf(chatter.name);
        if (index > -1) {
          this.chatters.splice(index, 1);
        }
      }
    });

   }

  ngOnInit() {
  }

  isScreenSmall() {
    return this.mediaMatcher.matches;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    // this.subscription.unsubscribe();
  }

}
