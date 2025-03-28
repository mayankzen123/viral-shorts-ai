# Short Video Creator

A modern web application that helps content creators generate short-form video scripts and slideshows based on trending topics. Built with Next.js 15, React 19, TypeScript, and the Vercel AI SDK.

## Features

- **Topic Selection**: Choose from various categories like technology, science, news, facts, and more
- **Trending Topics**: Discover top 10 trending topics in your selected category with popularity metrics
- **Script Generation**: Generate engaging video scripts optimized for short-form content
- **Script Analysis**: View your script broken down into hooks, main content, and calls to action
- **Visual Generation**: Create AI-generated images with Studio Ghibli-inspired art style:
  - Whimsical, painterly aesthetics reminiscent of Hayao Miyazaki films
  - Soft, vibrant colors and dreamlike lighting
  - Hand-drawn animation style with detailed backgrounds
  - Perfect for creating engaging, artistic visuals for your content
- **Audio Narration**: Generate voiceovers with choice of multiple AI voices:
  - Nova (Female) - A pleasant, professional voice with clear articulation
  - Onyx (Male) - A deep, authoritative voice with rich tonality
  - Shimmer (Female) - A bright, engaging voice with a vibrant delivery
  - Echo (Male) - A smooth, calming voice with a measured pace
- **Slideshow Creation**: Combine generated Ghibli-style images and audio into professional slideshows
- **Video Download**: Save generated content to share on social media platforms

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI, Framer Motion
- **AI Integration**: OpenAI GPT-4o, DALL-E 3 (with Studio Ghibli styling) via Vercel AI SDK
- **Styling**: Tailwind CSS with custom animations and transitions
- **Audio/Video**: Web Audio API and HTML5 Video

## Project Structure

```
.
├── public/            # Static assets
├── src/               # Source code
│   ├── app/           # Next.js App Router
│   │   ├── api/       # API route handlers
│   │   │   ├── generate-audio/     # Audio generation endpoint
│   │   │   ├── generate-image/     # Image generation endpoint
│   │   │   ├── generate-script/    # Script generation endpoint
│   │   │   ├── generate-video/     # Video/slideshow endpoint
│   │   │   └── trending/           # Trending topics endpoint
│   │   ├── media/     # Media creation pages
│   │   │   └── [id]/  # Dynamic route for script-specific media
│   │   ├── layout.tsx # Root layout
│   │   └── page.tsx   # Homepage
│   ├── components/    # Reusable components
│   │   ├── ui/        # UI components (Shadcn)
│   │   ├── Header.tsx # App header
│   │   └── Slideshow.tsx # Slideshow player component
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── types/         # TypeScript type definitions
├── .env.local         # Environment variables (create your own)
├── next.config.ts     # Next.js configuration
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd video-creator
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file and add your OpenAI API key
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Usage

1. Select a topic category from the dropdown
2. Browse the list of trending topics in your chosen category
3. Click "Generate Script" on a topic that interests you
4. On the media page:
   - View and customize your generated script
   - Generate Studio Ghibli-style images for each visual suggestion
   - Create audio narration with your preferred voice
   - Combine everything into a slideshow
   - Download your finished content

## Studio Ghibli-Style Image Generation

This application features a unique image generation capability that creates visuals inspired by Studio Ghibli's distinctive art style:

- **Artistic Style**: All generated images feature the whimsical, painterly aesthetics characteristic of Hayao Miyazaki films
- **Color Palette**: Soft, vibrant colors and dreamlike lighting that creates a magical atmosphere
- **Natural Elements**: Enhanced focus on beautiful natural elements and environments
- **Animation Look**: Maintains the hand-drawn animation feel with detailed backgrounds and charming character design
- **Storytelling**: Images are designed to complement your script content while maintaining the Ghibli aesthetic

This feature leverages DALL-E 3's advanced image generation capabilities with carefully crafted prompts to ensure a consistent Studio Ghibli aesthetic across all your content.

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
