import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface LiveEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  filmId: string;
  eventType: 'PLAY' | 'PAUSE' | 'PROGRESS' | 'SEEK' | 'ENDED';
  timestamp: string;
  currentTime: number;
  duration: number;
  progress: number;
  userAgent: string;
  ipAddress: string;
}

export interface ViewerUpdate {
  type: 'concurrent_viewers' | 'total_viewers';
  filmId: number;
  count: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connected = false;

  private liveEventsSubject = new BehaviorSubject<LiveEvent | null>(null);
  private viewerUpdatesSubject = new BehaviorSubject<ViewerUpdate | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  public liveEvents$ = this.liveEventsSubject.asObservable();
  public viewerUpdates$ = this.viewerUpdatesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const socket = new SockJS('/ws');
    
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP Debug: ', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket: ', frame);
      this.connected = true;
      this.connectionStatusSubject.next(true);
      this.subscribeToTopics();
    };

    this.stompClient.onDisconnect = () => {
      console.log('Disconnected from WebSocket');
      this.connected = false;
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ', frame.headers['message']);
      console.error('Additional details: ', frame.body);
      this.connected = false;
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.activate();
  }

  private subscribeToTopics(): void {
    if (!this.stompClient || !this.connected) {
      console.error('STOMP client is not connected');
      return;
    }

    // Subscribe to live events from Kafka
    this.stompClient.subscribe('/topic/live-events', (message: IMessage) => {
      try {
        const liveEvent: LiveEvent = JSON.parse(message.body);
        console.log('[LIVE-FEED] Live event received:', liveEvent);
        this.liveEventsSubject.next(liveEvent);
      } catch (error) {
        console.error('[LIVE-FEED] Error parsing live event:', error);
      }
    });

    // Subscribe to real-time analytics for viewer updates
    this.stompClient.subscribe('/topic/real-time-analytics', (message: IMessage) => {
      try {
        const update = JSON.parse(message.body);
        console.log('[VIEWER-UPDATES] Analytics update received:', update);
        
        if (update.type === 'concurrent_viewers') {
          const viewerUpdate: ViewerUpdate = {
            type: 'concurrent_viewers',
            filmId: update.filmId,
            count: update.count,
            timestamp: update.timestamp
          };
          this.viewerUpdatesSubject.next(viewerUpdate);
        } else if (update.type === 'total_viewers') {
          const viewerUpdate: ViewerUpdate = {
            type: 'total_viewers',
            filmId: 0, 
            count: update.count,
            timestamp: update.timestamp
          };
          this.viewerUpdatesSubject.next(viewerUpdate);
        }
      } catch (error) {
        console.error('[VIEWER-UPDATES] Error parsing analytics update:', error);
      }
    });

    console.log('Subscribed to WebSocket topics');
  }

  // Send message to backend (if needed)
  sendMessage(destination: string, message: any): void {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Connection management
  connect(): void {
    if (!this.connected && this.stompClient) {
      this.stompClient.activate();
    }
  }

  disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate();
      this.connected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
