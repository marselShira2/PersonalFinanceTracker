import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private loadedScripts = new Set<string>();

  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedScripts.has(src)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';

      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };

      script.onerror = () => reject(new Error(`Failed to load script ${src}`));

      document.body.appendChild(script);
    });
  }

  loadMetronicScripts(): Promise<void> {
    // Only load scripts.bundle.js dynamically
    return this.loadScript('/assets/js/scripts.bundle.js');
  }
}
