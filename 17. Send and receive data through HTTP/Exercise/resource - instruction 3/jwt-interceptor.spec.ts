import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { jwtInterceptor } from './jwt-interceptor';
import { UserModel } from './models/user-model';
import { UserService } from './services/user-service';

describe('jwtInterceptor', () => {
  let currentUser: WritableSignal<UserModel | undefined>;
  let userService: Pick<UserService, 'currentUser'>;
  let http: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    currentUser = signal(undefined);
    userService = { currentUser };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userService }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should do nothing if no jwt token', () => {
    httpClient.get('/api/foo').subscribe();

    const testRequest = http.expectOne('/api/foo');

    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should send a jwt token', () => {
    currentUser.set({ token: 'hello' } as UserModel);

    httpClient.get('/api/foo').subscribe();

    const testRequest = http.expectOne('/api/foo');

    expect(testRequest.request.headers.get('Authorization')).toBe('Bearer hello');
  });
});
