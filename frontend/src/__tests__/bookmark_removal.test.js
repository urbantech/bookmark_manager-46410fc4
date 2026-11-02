import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockBookmark = {
  id: 1,
  url: 'https://example.com',
  title: 'Example Bookmark',
  tags: ['example', 'test']
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookmarkRemoval Component', () => {
  it('renders correctly', () => {
    render(<BookmarkRemoval bookmark={mockBookmark} />);
    expect(screen.getByTestId('bookmark_removal-container')).toBeInTheDocument();
    expect(screen.getByText('Remove Bookmark')).toBeInTheDocument();
  });

  it('handles user interactions by removing bookmark', async () => {
    const mockFetch = require('node-fetch');
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ success: true }),
      ok: true
    });

    render(<BookmarkRemoval bookmark={mockBookmark} />);
    const button = screen.getByRole('button', { name: /remove bookmark/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://api.ainative.studio/bookmarks/1', {
        method: 'DELETE',
        headers: { 'X-API-Key': 'your-api-key' }
      });
      expect(screen.getByText(/bookmark removed successfully/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while removing bookmark', async () => {
    const mockFetch = require('node-fetch');
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<BookmarkRemoval bookmark={mockBookmark} />);
    const button = screen.getByRole('button', { name: /remove bookmark/i });
    await userEvent.click(button);

    expect(screen.getByText(/removing bookmark.../i)).toBeInTheDocument();
  });

  it('handles API errors when removing bookmark', async () => {
    const mockFetch = require('node-fetch');
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ error: 'Failed to remove bookmark' }),
      ok: false
    });

    render(<BookmarkRemoval bookmark={mockBookmark} />);
    const button = screen.getByRole('button', { name: /remove bookmark/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to remove bookmark/i)).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    render(<BookmarkRemoval bookmark={mockBookmark} />);
    const button = screen.getByRole('button', { name: /remove bookmark/i });
    expect(button).toHaveAttribute('aria-label', 'Remove Example Bookmark');
  });
});