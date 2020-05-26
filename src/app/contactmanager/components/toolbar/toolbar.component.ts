import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { User } from '../../models/user';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();
  activeUser: User;
  constructor(private chatService: ChatService) {

    this.chatService.getActiveUser().subscribe(user => {
      this.activeUser = user;
    });
  }

  ngOnInit() {
  }

}
