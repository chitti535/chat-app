import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartService } from 'src/services/chart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'chart-app';
  message = '';
  messages: any[] = [];
  chatters: any[] = [];

  subscription: Subscription;
  chattersSubscription: Subscription;
  chattersRemoveSubscription: Subscription;

  // constructor(private chartService: ChartService) {

  //   this.subscription = this.chartService.get().subscribe(message => {
  //     if (message) {
  //       this.messages.push(message);
  //     } else {
  //       // clear messages when empty message received
  //       this.messages = [];
  //     }
  //   });

  //   this.chattersSubscription = this.chartService.addChatter().subscribe(chatter => {
  //     if (chatter) {
  //       this.chatters.push(chatter.name);
  //     }
  //   });

  //   this.chattersRemoveSubscription = this.chartService.removeChatter().subscribe(chatter => {
  //     if (chatter) {
  //       const index = this.chatters.indexOf(chatter.name);
  //       if (index > -1) {
  //         this.chatters.splice(index, 1);
  //       }
  //     }
  //   });

  // }

  // onSendMessage() {
  //   this.chartService.send(this.message);
  // }

  // onClickCharter(charter) {

  // }

  // ngOnDestroy() {
  //   // unsubscribe to ensure no memory leaks
  //   this.subscription.unsubscribe();
  // }
}
