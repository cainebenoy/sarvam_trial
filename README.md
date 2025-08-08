# Amma's Digital Scoldings (അമ്മയുടെ വഴക്ക്)

A fun web application that generates Malayalam mother's scoldings using AI. The app creates authentic Manglish scoldings and converts them to Malayalam speech.

## Features

- **AI-Powered Scolding Generation**: Uses Google Gemini AI to generate creative Manglish scoldings
- **Malayalam Translation**: Automatically translates Manglish to proper Malayalam
- **Text-to-Speech**: Converts Malayalam text to natural-sounding speech using SarvamAI
- **Auto-Play Audio**: Plays generated scoldings automatically (with fallback controls)
- **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS with custom warm color palette
- **AI Services**: 
  - Google Gemini AI (gemini-2.0-flash-exp) for text generation and translation
  - SarvamAI TTS API with "Arya" voice model for Malayalam speech synthesis
- **UI Components**: Custom components built with shadcn/ui

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Google Gemini API key
- SarvamAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cainebenoy/sarvam_trial.git
cd sarvam_trial
```

2. Install dependencies:
```bash
pnpm install --legacy-peer-deps
# or
npm install --legacy-peer-deps
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
```

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

#### SarvamAI API Key
1. Sign up at [SarvamAI](https://www.sarvam.ai/)
2. Get your API key from the dashboard
3. Copy the key to your `.env.local` file

### Running the Application

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click the "Get a Scolding!" button
2. Wait for the AI to generate a creative Manglish scolding
3. The text will be translated to Malayalam and converted to speech
4. Audio will play automatically (or show a play button if autoplay is blocked)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── scolding/          # Gemini AI scolding generation
│   │   └── tts-malayalam/     # Translation and TTS pipeline
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── scolding-generator.tsx # Main component
│   ├── theme-provider.tsx
│   └── ui/                    # UI components
├── lib/
│   └── utils.ts
└── public/
    └── audio/                 # Generated audio files (for debugging)
```

## API Endpoints

- `POST /api/scolding` - Generates Manglish scolding using Gemini AI
- `POST /api/tts-malayalam` - Translates to Malayalam and generates speech

## Features in Detail

### Scolding Generation
- Uses Gemini AI with creative temperature settings
- Generates authentic Manglish expressions
- Focuses on typical maternal concerns and phrases

### Translation Pipeline
- Automatically translates Manglish to proper Malayalam
- Maintains cultural context and emotional tone
- Uses Gemini's translation capabilities

### Audio Generation
- Malayalam text-to-speech using SarvamAI
- "Arya" voice model for natural female voice
- High-quality audio output in MP3 format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and entertainment purposes. Please ensure you comply with the respective API providers' terms of service.

## Acknowledgments

- Google Gemini AI for text generation and translation
- SarvamAI for Malayalam text-to-speech
- The Malayalam-speaking community for inspiration

---

Made with ❤️ for nostalgic memories of Amma's loving scoldings!
