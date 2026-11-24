import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'manos_seguras_theme';

  // Signal reactivo con el estado del tema
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    // Aplicar clase en el elemento raíz al inicializar
    this.applyThemeToDOM(this.currentTheme());

    // Reaccionar automáticamente a los cambios de valor
    effect(() => {
      const theme = this.currentTheme();
      this.applyThemeToDOM(theme);
      this.persistTheme(theme);
    });
  }

  /**
   * Alterna entre modo claro y modo oscuro
   */
  toggleTheme(): void {
    const next: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(next);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') {
      return 'light';
    }
    try {
      const saved = localStorage.getItem(this.THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  }

  private applyThemeToDOM(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }

  private persistTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch {}
  }
}
