/**
 * React Testing Library Helpers
 * Custom render functions and utilities
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// CUSTOM RENDER WITH PROVIDERS
// ============================================

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add providers here if needed (e.g., Context providers, Router providers)
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// ============================================
// FORM HELPERS
// ============================================

/**
 * Fill out a form with given data
 */
export async function fillForm(
  container: HTMLElement,
  data: Record<string, string>
) {
  const user = userEvent.setup();

  for (const [name, value] of Object.entries(data)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
}

/**
 * Submit a form
 */
export async function submitForm(container: HTMLElement) {
  const user = userEvent.setup();
  const form = container.querySelector('form');
  
  if (!form) {
    throw new Error('Form not found');
  }

  const submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    await user.click(submitButton);
  } else {
    // If no submit button, trigger form submit event
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
}

// ============================================
// WAIT HELPERS
// ============================================

/**
 * Wait for an element to appear
 */
export function waitForElement(
  container: HTMLElement,
  selector: string,
  timeout: number = 3000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = container.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Wait for element to disappear
 */
export function waitForElementToDisappear(
  container: HTMLElement,
  selector: string,
  timeout: number = 3000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = container.querySelector(selector);
    if (!element) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(selector);
      if (!element) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} still present after ${timeout}ms`));
    }, timeout);
  });
}

// ============================================
// ASYNC HELPERS
// ============================================

/**
 * Wait for async operation
 */
export const waitFor = (callback: () => void | Promise<void>, options?: { timeout?: number; interval?: number }) => {
  const timeout = options?.timeout || 3000;
  const interval = options?.interval || 50;
  const startTime = Date.now();

  return new Promise<void>((resolve, reject) => {
    const check = async () => {
      try {
        await callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };
    check();
  });
};

// ============================================
// MOCK API HELPERS
// ============================================

/**
 * Mock successful API response
 */
export function mockApiSuccess<T>(data: T, delay: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data }),
      });
    }, delay);
  });
}

/**
 * Mock API error response
 */
export function mockApiError(message: string, status: number = 400, delay: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        status,
        json: () => Promise.resolve({ success: false, message }),
      });
    }, delay);
  });
}

// ============================================
// COMPONENT HELPERS
// ============================================

/**
 * Get all text content from element
 */
export function getAllText(element: HTMLElement): string {
  return element.textContent || '';
}

/**
 * Check if element has class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Get element by test ID
 */
export function getByTestId(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
  if (!element) {
    throw new Error(`Element with test ID "${testId}" not found`);
  }
  return element;
}

/**
 * Query element by test ID
 */
export function queryByTestId(container: HTMLElement, testId: string): HTMLElement | null {
  return container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
}

// ============================================
// DEBUGGING HELPERS
// ============================================

/**
 * Print component HTML for debugging
 */
export function debugComponent(container: HTMLElement) {
  console.log('=== Component HTML ===');
  console.log(container.innerHTML);
  console.log('======================');
}

/**
 * Print all form fields
 */
export function debugForm(container: HTMLElement) {
  const form = container.querySelector('form');
  if (!form) {
    console.log('No form found');
    return;
  }

  console.log('=== Form Fields ===');
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const element = input as HTMLInputElement;
    console.log(`${element.name || element.id}: ${element.value}`);
  });
  console.log('===================');
}

// ============================================
// ACCESSIBILITY HELPERS
// ============================================

/**
 * Check if element is accessible
 */
export function checkAccessibility(element: HTMLElement): {
  hasLabel: boolean;
  hasAriaLabel: boolean;
  hasRole: boolean;
  hasTabIndex: boolean;
} {
  return {
    hasLabel: !!element.getAttribute('aria-label') || !!element.querySelector('label'),
    hasAriaLabel: !!element.getAttribute('aria-label'),
    hasRole: !!element.getAttribute('role'),
    hasTabIndex: element.getAttribute('tabindex') !== null,
  };
}

// ============================================
// RE-EXPORTS
// ============================================

export { render, screen, within, fireEvent, waitFor as rtlWaitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
