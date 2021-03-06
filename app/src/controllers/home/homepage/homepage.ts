import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Navigation as NavigationService } from '../../../services/navigation';
import { SessionFactory } from '../../../services/session';
import { MindsTitle } from '../../../services/ux/title';
import { Client } from '../../../services/api';
import { SignupModalService } from '../../../components/modal/signup/service';

@Component({
  moduleId: module.id,
  selector: 'minds-homepage',
  templateUrl: 'homepage.html'
})

export class Homepage {

  videos : Array<any> = [];
  blogs : Array<any> = [];
  channels : Array<any> = [];
  stream = {
    1: [],
    2: [],
    3: []
    };
  inProgress : boolean = false;

  session = SessionFactory.build();
  minds = window.Minds;

  flags = {
    canPlayInlineVideos: true
  };

  constructor(public client: Client, public title: MindsTitle, public router : Router, public navigation: NavigationService, private modal : SignupModalService){
    this.title.setTitle("Home");
    this.loadStream();
    //this.loadVideos();
    //this.loadBlogs();

    if (/iP(hone|od)/.test(window.navigator.userAgent)) {
      this.flags.canPlayInlineVideos = false;
    }
  }

  loadStream(){
    this.inProgress = true;
    this.client.get('api/v1/newsfeed/featured', { limit: 24 })
      .then((response : any) => {
        let col = 0;
        for(let activity of response.activity){
          //split stream into 3 columns
          if(col++ >= 3)
            col = 1;
          this.stream[col].push(activity);
        }
        this.inProgress = false;
      })
      .catch(() => {
        this.inProgress = false;
      });
  }

  loadVideos(){
    this.client.get('api/v1/entities/featured/videos', { limit: 4 })
      .then((response : any) => {
        this.videos = response.entities;
      });
  }

  loadBlogs(){
    this.client.get('api/v1/blog/featured', { limit: 4 })
      .then((response : any) => {
        this.blogs = response.blogs;
      });
  }

  registered(){
    this.modal.setDisplay('onboarding').open();
    this.router.navigate(['/newsfeed']);
  }

}
