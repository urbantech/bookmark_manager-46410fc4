import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockedFetch = jest.requireMock('node-fetch');

beforeEach(() => {
  mockedFetch.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BookmarkCreation Component', () => {
  test('renders correctly', () => {
    render(<BookmarkCreation />);
    expect(screen.getByTestId('bookmark_creation-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<BookmarkCreation />);

    await user.type(screen.getByLabelText(/title/i), 'Test Bookmark');
    await user.type(screen.getByLabelText(/url/i), 'https://example.com');
    await user.type(screen.getByLabelText(/tags/i), 'test, bookmark');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.ainative.studio',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-API-Key': expect.any(String),
        }),
        body: JSON.stringify({
          title: 'Test Bookmark',
          url: 'https://example.com',
          tags: ['test', 'bookmark'],
        }),
      })
    );
  });

  test('shows loading state', async () => {
    mockedFetch.mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<BookmarkCreation />);

    await user.type(screen.getByLabelText(/title/i), 'Loading Bookmark');
    await user.type(screen.getByLabelText(/url/i), 'https://loading.example.com');
    await user.type(screen.getByLabelText(/tags/i), 'loading');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/saving.../i)).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('API Error'));
    const user = userEvent.setup();
    render(<BookmarkCreation />);

    await user.type(screen.getByLabelText(/title/i), 'Error Bookmark');
    await user.type(screen.getByLabelText(/url/i), 'https://error.example.com');
    await user.type(screen.getByLabelText(/tags/i), 'error');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/failed to save bookmark/i)).toBeInTheDocument();
  });

  test('is accessible', async () => {
    render(<BookmarkCreation />);
    expect(screen.getByLabelText(/title/i)).toHaveAccessibleName(/title/i);
    expect(screen.getByLabelText(/url/i)).toHaveAccessibleName(/url/i);
    expect(screen.getByLabelText(/tags/i)).toHaveAccessibleName(/tags/i);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });
});