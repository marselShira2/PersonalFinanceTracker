import { Injectable } from '@angular/core';
import { ILayout, LayoutType } from './configs/config';

@Injectable({
  providedIn: 'root'
})
export class LayoutInitService {

  constructor() { }

  // Initialize layout settings
  initLayoutSettings(layoutType: LayoutType) {
    // Example: target elements by ID
    const sidebar = document.getElementById('kt_app_sidebar');
    const header = document.getElementById('kt_app_header');
    const footer = document.getElementById('kt_app_footer');

    [sidebar, header, footer].forEach(el => {
      if (el) {
        this.cleanAttributes(el);
        this.cleanClasses(el);
      }
    });

    // ... any other initialization logic
  }

  // Re-initialize layout props
  reInitProps(layoutType: LayoutType) {
    this.initLayoutSettings(layoutType);
  }

  /**
   * Remove all data- attributes safely
   */
  private cleanAttributes(element: HTMLElement) {
    const attrs = element.getAttributeNames().filter(attr => attr.startsWith('data-'));
    attrs.forEach(attr => element.removeAttribute(attr));
  }

  /**
   * Remove all CSS classes safely
   */
  private cleanClasses(element: HTMLElement) {
    // Split classes and filter out empty strings
    const classes = element.className.split(' ').filter(c => c.trim() !== '');
    classes.forEach(c => element.classList.remove(c));
  }

  /**
   * Utility: apply new attributes safely
   */
  public applyAttributes(element: HTMLElement, attributes: { [key: string]: string }) {
    if (!element || !attributes) return;
    Object.keys(attributes).forEach(key => {
      if (key && attributes[key] != null) {
        element.setAttribute(key, attributes[key]);
      }
    });
  }

  /**
   * Utility: apply new classes safely
   */
  public applyClasses(element: HTMLElement, classes: string[]) {
    if (!element || !classes) return;
    const safeClasses = classes.filter(c => c && c.trim() !== '');
    if (safeClasses.length) {
      element.classList.add(...safeClasses);
    }
  }
}
