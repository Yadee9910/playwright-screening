import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

type Fixtures = {
  todoPage: TodoPage;
};

/**
 * Custom test with a ready-to-use TodoPage.
 * A test that asks for `todoPage` gets the app already opened.
 */
export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect };
