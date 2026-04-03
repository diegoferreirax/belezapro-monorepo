import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageRepository {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  get<T>(key: string): T[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  save<T>(key: string, data: T[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getRaw<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveRaw<T>(key: string, data: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getOne<T extends { id: string }>(key: string, id: string): T | undefined {
    const items = this.get<T>(key);
    return items.find(item => item.id === id);
  }

  add<T extends { id: string }>(key: string, item: T): void {
    const items = this.get<T>(key);
    items.push(item);
    this.save(key, items);
  }

  update<T extends { id: string }>(key: string, item: T): void {
    const items = this.get<T>(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      this.save(key, items);
    }
  }

  delete(key: string, id: string): void {
    const items = this.get<{ id: string }>(key);
    const filtered = items.filter(i => i.id !== id);
    this.save(key, filtered);
  }
}
