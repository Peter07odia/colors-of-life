import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

// Mock next/image since it's not available in the test environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onError, onLoadingComplete, ...props }: any) => {
    // Simulate onLoadingComplete callback to test loading state
    if (onLoadingComplete) {
      setTimeout(() => {
        onLoadingComplete();
      }, 0);
    }
    return <img src={src} alt={alt} {...props} data-testid="next-image" />;
  },
}));

describe('OptimizedImage Component', () => {
  it('renders with the correct props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('handles loading state correctly', async () => {
    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    // Check if loading placeholder is present
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  });

  it('uses fallback image when error occurs', () => {
    const { rerender } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    // Get the image and simulate an error
    const image = screen.getByTestId('next-image');
    image.dispatchEvent(new Event('error'));

    // Re-render to see the changes
    rerender(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    // Check if the fallback image is used
    expect(image).toHaveAttribute('src', '/images/user-avatar.svg');
    expect(image).toHaveAttribute('alt', 'Image not available');
  });

  it('applies custom class names', () => {
    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
        className="custom-image-class"
        containerClassName="custom-container-class"
      />
    );

    const imageContainer = container.firstChild;
    expect(imageContainer).toHaveClass('custom-container-class');
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveClass('custom-image-class');
  });
}); 