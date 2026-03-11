import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { Message, Conversation, User } from '../../models/models';

@Component({
  selector: 'app-provider-messages',
  imports: [FormsModule, HeaderComponent],
  templateUrl: './provider-messages.html',
})
export class ProviderMessagesComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  loadingConversations = signal(true);
  loadingMessages = signal(false);
  sendingMessage = signal(false);

  activeConversationUserId = signal<string | null>(null);
  newMessage = signal('');

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadConversations();
    const userId = this.route.snapshot.paramMap.get('customerId');
    if (userId) {
      this.openConversation(userId);
    }
    this.pollInterval = setInterval(() => {
      this.loadConversations();
      if (this.activeConversationUserId()) {
        this.loadMessages(this.activeConversationUserId()!);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadConversations(): void {
    this.apiService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations.set(conversations);
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false),
    });
  }

  openConversation(userId: string): void {
    this.activeConversationUserId.set(userId);
    this.router.navigate(['/provider-messages', userId], { replaceUrl: true });
    this.loadMessages(userId);
  }

  loadMessages(userId: string): void {
    this.loadingMessages.set(true);
    this.apiService.getMessages(userId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.loadingMessages.set(false);
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    const toUserId = this.activeConversationUserId();
    if (!text || !toUserId || this.sendingMessage()) return;
    this.sendingMessage.set(true);
    this.apiService.sendMessage(toUserId, text).subscribe({
      next: () => {
        this.newMessage.set('');
        this.sendingMessage.set(false);
        this.loadMessages(toUserId);
        this.loadConversations();
      },
      error: () => this.sendingMessage.set(false),
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  activeConversation = computed(() => {
    const userId = this.activeConversationUserId();
    if (!userId) return null;
    return this.conversations().find((c) => {
      const other = this.getOtherParticipant(c);
      return other?._id === userId;
    }) || null;
  });

  getOtherParticipant(conv: Conversation): User | null {
    const myId = this.authService.user()?._id;
    const parts = conv.participants;
    if (!parts) return null;
    const other = parts.find((p) => {
      const id = typeof p === 'object' ? (p as User)._id : p;
      return id !== myId;
    });
    if (!other || typeof other !== 'object') return null;
    return other as User;
  }

  getOtherName(conv: Conversation): string {
    return this.getOtherParticipant(conv)?.name || 'Customer';
  }

  getOtherInitial(conv: Conversation): string {
    return this.getOtherName(conv).charAt(0).toUpperCase();
  }

  getLastMessage(conv: Conversation): string {
    const last = conv.lastMessage;
    if (!last) return 'No messages yet';
    if (typeof last === 'object' && 'content' in last) return (last as Message).content;
    return '';
  }

  isMyMessage(msg: Message): boolean {
    const myId = this.authService.user()?._id;
    if (typeof msg.sender === 'object') return (msg.sender as User)._id === myId;
    return msg.sender === myId;
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString('en-PH', { weekday: 'short' });
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

getOtherImage(conv: Conversation): string | undefined {
  return this.getOtherParticipant(conv)?.profileImage ?? undefined;
}
}