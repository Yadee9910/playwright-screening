import type { Locator, Page } from '@playwright/test';

/**
 * Page object for https://demo.playwright.dev/todomvc
 * Holds locators and user actions only.
 */
export class TodoPage {
  readonly newTodoInput: Locator;
  readonly items: Locator;
  readonly counter: Locator;
  readonly clearCompletedButton: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('checkbox', { name: 'Toggle Todo' }) });
    this.counter = page.getByText(/\d+ items? left/);
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto(): Promise<void> {
    await this.page.goto('./');
  }

  item(text: string): Locator {
    return this.items.filter({ has: this.page.getByText(text, { exact: true }) });
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(texts: readonly string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  async complete(text: string): Promise<void> {
    await this.item(text).getByRole('checkbox', { name: 'Toggle Todo' }).check();
  }

  async edit(oldText: string, newText: string): Promise<void> {
    await this.item(oldText).getByText(oldText, { exact: true }).dblclick();

    const editBox = this.page.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.press('Enter');
  }

  async delete(text: string): Promise<void> {
    const row = this.item(text);
    await row.hover();
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  async filterBy(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async waitForSavedCount(count: number): Promise<void> {
    await this.page.waitForFunction(
      (expected) => JSON.parse(localStorage.getItem('react-todos') ?? '[]').length === expected,
      count,
    );
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
