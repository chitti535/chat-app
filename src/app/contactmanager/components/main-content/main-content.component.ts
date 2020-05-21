import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { User } from '../../models/user';
import { Message } from '../../models/message';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
userTo: User;
loginUser: User;
message = '';
messages: Message[] = [];

  constructor(
    private route: ActivatedRoute,
    private service: ChatService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.userTo = this.service.getUserById(id);
    });
    this.loginUser = this.service.getLoginUser();

    this.service.get().subscribe(message => {
      message.isFrom = false;
      if(message.id === this.loginUser.id) {
        message.isFrom = true;
      }
      this.messages.push(message);
    });
  }

  sendMessage() {
    console.log(this.message);
    this.service.send(this.message);
    this.message = '';
  }
}
