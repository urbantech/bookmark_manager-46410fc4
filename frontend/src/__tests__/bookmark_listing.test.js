import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookmarkListing Component', () => {
  const mockBookmarks = [
    { id: 1, title: 'Example Bookmark 1', url: 'http://example.com/1', tags: ['example', 'test'] },
    { id: 2, title: 'Example Bookmark 2', url: 'http://example.com/2', tags: ['example', 'react'] }
  ];

  test('renders correctly with bookmarks', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    });

    render(<BookmarkListing />);

    await waitFor(() => {
      expect(screen.getByTestId('bookmark_listing-container')).toBeInTheDocument();
      expect(screen.getByText('Example Bookmark 1')).toBeInTheDocument();
      expect(screen.getByText('Example Bookmark 2')).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching bookmarks', () => {
    render(<BookmarkListing />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API errors by showing an error message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      statusText: 'API Error',
    });

    render(<BookmarkListing />);

    await waitFor(() => {
      expect(screen.getByText(/error loading bookmarks/i)).toBeInTheDocument();
    });
  });

  test('removes a bookmark when the delete button is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    }).mockResolvedValueOnce({
      ok: true,
    });

    render(<BookmarkListing />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
    });

    userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('https://api.ainative.studio/api/v1/bookmarks/1', {
        method: 'DELETE',
        headers: {
          'X-API-Key': 'your-api-key-here',
          'Content-Type': 'application/json',
        },
      });
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(1);
    });
  });

  test('is accessible', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    });

    render(<BookmarkListing />);

    await waitFor(() => {
      expect(screen.getByTestId('bookmark_listing-container')).toHaveAttribute('aria-label', 'Bookmark List');
      expect(screen.getAllByRole('article')).toHaveLength(2);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
    });
  });
});