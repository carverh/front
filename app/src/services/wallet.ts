import { Inject, Injector } from '@angular/core';
import { Client } from './api';
import { SessionFactory } from './session';

export class WalletService {

  points : number = 0;
  session = SessionFactory.build();

  constructor(@Inject(Client) public client : Client){
    this.getBalance();
    this.session.isLoggedIn((is) => {
      if(!is && window.Minds.wallet){
        window.Minds.wallet.balance = '...';
        this.sync();
        window.Minds.wallet = null;
      }
    });
  }

  /**
   * Increment the wallet
   */
  increment(points : number = 1){
    window.Minds.wallet.balance = window.Minds.wallet.balance + points;
    this.points = window.Minds.wallet.balance;
    this.sync();
  }

  /**
   * Decrement the wallet
   */
  decrement(points : number = 1){
    window.Minds.wallet.balance = window.Minds.wallet.balance - points;
    this.points = window.Minds.wallet.balance;
    this.sync();
  }

  /**
   * Return the balance
   */
   getBalance(refresh : boolean = false){
     if(!window.Minds.wallet || refresh){
       window.Minds.wallet = { balance: '...' };
       this.client.get('api/v1/wallet/count')
         .then((response : any) => {
           if(!response.count){
             window.Minds.wallet = null;
             return this;
           }
           this.points = response.count;
           window.Minds.wallet.balance = response.count;
           this.sync();
         });
        return;
     }
     this.points = window.Minds.wallet.balance;
   }

  /**
   * Sync points to the topbar Counter
   */
  sync(){
    for(var i in window.Minds.navigation.topbar){
      if(window.Minds.navigation.topbar[i].name == 'Wallet'){
        window.Minds.navigation.topbar[i].extras.counter = window.Minds.wallet.balance;
      }
    }
  }

  static _(client: Client) {
    return new WalletService(client);
  }
}
