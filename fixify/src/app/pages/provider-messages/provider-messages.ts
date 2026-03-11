import { Component, inject, signal, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Conversation, Message } from '../../models/models';

@Component({
  selector: 'app-provider-messages',
  imports: [RouterLink, FormsModule],
  templateUrl: './provider-messages.html',
})
export class ProviderMessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  selectedUserId = signal('');
  selectedUser = signal<{ name: string; profileImage?: string } | null>(null);

  loadingConversations = signal(true);
  loadingMessages = signal(false);
  searchQuery = signal('');
  newMessage = signal('');
  sending = signal(false);

  private shouldScroll = false;
  private pollInterval: any;

  ngOnInit(): void {
    this.loadConversations();
    this.route.queryParamMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) this.selectConversation(userId);
    });
    this.pollInterval = setInterval(() => {
      if (this.selectedUserId()) this.loadMessages(this.selectedUserId(), false);
    }, 5000);
  }

  ngOnDestroy(): void { clearInterval(this.pollInterval); }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  loadConversations(): void {
    this.loadingConversations.set(true);
    this.apiService.getConversations().subscribe({
      next: (c) => { this.conversations.set(c); this.loadingConversations.set(false); },
      error: () => this.loadingConversations.set(false),
    });
  }

  filteredConversations() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.conversations();
    return this.conversations().filter((c) => c.otherUser.name.toLowerCase().includes(q));
  }

  selectConversation(userId: string, user?: any): void {
    this.selectedUserId.set(userId);
    if (user) this.selectedUser.set(user);
    else {
      const conv = this.conversations().find((c) => c.otherUser._id === userId);
      if (conv) this.selectedUser.set(conv.otherUser);
    }
    this.loadMessages(userId, true);
  }

  loadMessages(userId: string, showLoader = true): void {
    if (showLoader) this.loadingMessages.set(true);
    this.apiService.getMessages(userId).subscribe({
      next: (m) => { this.messages.set(m); this.loadingMessages.set(false); this.shouldScroll = true; },
      error: () => this.loadingMessages.set(false),
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text || !this.selectedUserId() || this.sending()) return;
    this.sending.set(true);
    this.apiService.sendMessage(this.selectedUserId(), text).subscribe({
      next: (msg) => {
        this.messages.update((m) => [...m, msg]);
        this.newMessage.set('');
        this.sending.set(false);
        this.shouldScroll = true;
        this.loadConversations();
      },
      error: () => this.sending.set(false),
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.sendMessage(); }
  }

  scrollToBottom(): void {
    try { this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  isMine(msg: Message): boolean {
    const me = this.authService.user()?._id;
    const sender = typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)._id;
    return sender === me;
  }

  logout(): void { this.authService.logout(); }

  formatTime(d?: string): string {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  getInitial(name: string): string { return name?.charAt(0).toUpperCase() || '?'; }
}