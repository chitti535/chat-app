import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

loggerMsg ='';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ChatService) {

      this.service.get().subscribe(message => {
        this.loginUser = this.service.getLoginUser();

        console.log('on message recieve');
        message.isFrom = false;
        if(message.id === this.loginUser.id) {
          message.isFrom = true;
        }
        this.messages.push(message);
      });

      this.router.events.subscribe(() => {
        const id = this.route.snapshot.paramMap.get('id');
        this.userTo = this.service.getUserById(id);
      });
    }

  ngOnInit() {
    // this.route.params.subscribe(params => {
    //   const id = params['id'];
    //   this.userTo = this.service.getUserById(id);
    // });
  }

  sendMessage() {
    console.log(this.message);
    this.service.send(this.message);
    this.message = '';
  }


  // ///Stream related
  // logger(msg) {
  //   this.loggerMsg = msg
  // }
  // //End stream related
}
