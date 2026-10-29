import { test, expect } from '../../fixtures';

const TODOS = ['Buy milk', 'Walk the dog', 'Write tests'] as const;

test.describe('TodoMVC', () => {
  test('adds three todos and shows them in the list', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);

    await expect(todoPage.items).toHaveText([...TODOS]);
    await expect(todoPage.newTodoInput).toBeEmpty();
  });

  test('completing one todo updates the counter to "2 items left"', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);

    await todoPage.complete('Walk the dog');

    await expect(todoPage.counter).toHaveText('2 items left');
    await expect(
      todoPage.item('Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' }),
    ).toBeChecked();
  });

  test('Active and Completed filters show the right items', async ({ todoPage, page }) => {
    await todoPage.addTodos(TODOS);
    await todoPage.complete('Walk the dog');

    await todoPage.filterBy('Active');
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todoPage.items).toHaveText(['Buy milk', 'Write tests']);

    await todoPage.filterBy('Completed');
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todoPage.items).toHaveText(['Walk the dog']);

    await todoPage.filterBy('All');
    await expect(todoPage.items).toHaveText([...TODOS]);
  });

  test('editing a todo with double-click saves the new text', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);

    await todoPage.edit('Walk the dog', 'Walk the cat');

    await expect(todoPage.items).toHaveText(['Buy milk', 'Walk the cat', 'Write tests']);
  });

  test('deleting a todo removes it from the list', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);

    await todoPage.delete('Walk the dog');

    await expect(todoPage.item('Walk the dog')).toHaveCount(0);
    await expect(todoPage.items).toHaveText(['Buy milk', 'Write tests']);
  });

  test('"Clear completed" removes only completed todos', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);
    await todoPage.complete('Buy milk');
    await todoPage.complete('Write tests');

    await todoPage.clearCompleted();

    await expect(todoPage.items).toHaveText(['Walk the dog']);
    await expect(todoPage.counter).toHaveText('1 item left');
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('todos are still there after a page reload', async ({ todoPage }) => {
    await todoPage.addTodos(TODOS);
    await todoPage.complete('Buy milk');
    await todoPage.waitForSavedCount(TODOS.length);

    await todoPage.reload();

    await expect(todoPage.items).toHaveText([...TODOS]);
    await expect(
      todoPage.item('Buy milk').getByRole('checkbox', { name: 'Toggle Todo' }),
    ).toBeChecked();
  });

  test('empty or whitespace-only todos are not added', async ({ todoPage }) => {
    await todoPage.addTodo('');
    await todoPage.addTodo('    ');

    await expect(todoPage.items).toHaveCount(0);

    // Prove the input still works, so the check above isn't passing by accident.
    await todoPage.addTodo('Real todo');
    await expect(todoPage.items).toHaveText(['Real todo']);
  });
});

test.describe('TodoMVC: data-driven', () => {
  const datasets = [
    { name: 'groceries', todos: ['Eggs', 'Bread', 'Coffee', 'Rice'] },
    { name: 'work', todos: ['Review PR', 'Fix login bug'] },
    { name: 'special characters', todos: ['Café ☕', '<b>not bold</b>', 'Quotes "and" \'apostrophes\''] },
  ];

  for (const { name, todos } of datasets) {
    test(`adds every todo from the "${name}" list`, async ({ todoPage }) => {
      await todoPage.addTodos(todos);

      await expect(todoPage.items).toHaveText(todos);
      const label = todos.length === 1 ? 'item' : 'items';
      await expect(todoPage.counter).toHaveText(`${todos.length} ${label} left`);
    });
  }
});
