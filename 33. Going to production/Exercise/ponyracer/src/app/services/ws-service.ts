import { inject, Service, Type } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { environment } from '../../environments/environment.development';
import * as WebstompClient from 'webstomp-client';
import { WEBSOCKET, WEBSTOMP } from '../app.tokens';

@Service()
export class WsService {
  private readonly WebSocket: Type<WebSocket> = inject(WEBSOCKET);
  private readonly Webstomp: typeof WebstompClient = inject(WEBSTOMP);

  connect<T>(channel: string): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      // create the WebSocket connection
      const connection: WebSocket = new this.WebSocket(`${environment.wsBaseUrl}/ws`);

      // create the stomp client with Webstomp
      const stompClient: WebstompClient.Client = this.Webstomp.over(connection);

      // connect the stomp client
      let subscription: WebstompClient.Subscription;
      stompClient.connect(
        { login: '', passcode: '' },
        () => {
          // subscribe to the specific channel
          subscription = stompClient.subscribe(channel, message => {
            // emit the message received, after extracting the JSON from the body
            const bodyAsJson = JSON.parse(message.body) as T;
            observer.next(bodyAsJson);
          });
        },
        error => {
          // propagate the error
          observer.error(error);
        }
      );

      // handle the unsubscription
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        connection.close();
      };
    });
  }
}
