# Colors of Life

Colors of Life is an AI-powered fashion and style platform that helps users discover their perfect style through personalized recommendations.

## Project Overview

This project is a modern web application built with Next.js, TypeScript, and Tailwind CSS. The application features an Apple-like design aesthetic and focuses on delivering a premium user experience.

### Key Features (Planned)

1. **Onboarding Experience**
   - Guided visual journey
   - AI stylist consultation
   - Body scan and measurements

2. **Home & Discovery**
   - Style Stream for browsing trending looks
   - Personalized recommendations

3. **Product Experience**
   - AI-powered virtual try-on with Kling AI
   - Outfit visualization
   - Fashion search and discovery

4. **Checkout & Fulfillment**
   - Seamless purchasing experience
   - Delivery tracking

## AI Integration

### Kling AI Virtual Try-On

Colors of Life integrates with Kling AI's virtual try-on API to provide users with realistic clothing visualization. The feature allows users to:

- Upload their own photos
- Select clothing items from the catalog
- See how they would look wearing the selected items
- Experiment with different styles before purchasing

This integration provides a seamless shopping experience by letting users visualize clothing items on themselves before making a purchase decision.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd colors-of-life
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                  # Next.js app router pages
├── components/
│   ├── auth/             # Authentication components (1.0)
│   ├── onboarding/       # Onboarding flows (1.0)
│   │   ├── visual-journey/
│   │   ├── ai-stylist/
│   │   └── body-scan/
│   ├── home/             # Home & discovery components (2.0)
│   │   └── style-stream/
│   ├── product/          # Product experience components (3.0)
│   │   └── try-on/
│   ├── checkout/         # Checkout components (4.0)
│   ├── shared/           # Shared UI components 
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── styles/               # Global styles
```

## Design System

The application features a comprehensive design system found at `/design-system` route. This showcases all the UI components used throughout the application and serves as a reference for maintaining design consistency.

## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Headless UI
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Development Workflow

1. Start with UI components and design system
2. Implement the onboarding flow
3. Build the home and discovery features
4. Develop the product experience
5. Create the checkout and fulfillment process 