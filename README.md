# 🚇 CrowdCompass - Real-time Train Congestion Monitoring

AI-powered train carriage congestion analysis system using computer vision and LLM technology. Monitor real-time passenger capacity across multiple carriages and make informed boarding decisions.

## 🌟 Features

- **Real-time Video Analysis**: Analyze train carriage videos to determine congestion levels
- **Multi-carriage Monitoring**: Track up to 5 carriages simultaneously
- **AI-Powered Analysis**: Uses advanced vision models (AWS Bedrock & SambaNova)
- **Automatic Fallback**: Seamlessly switches between AI providers if one fails
- **API Key Rotation**: Distributes requests across multiple API keys to avoid rate limits
- **Bilingual Support**: Full internationalization (English/Japanese)
- **Live Updates**: Automatic analysis every 5 seconds with real-time status updates

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **AI Providers**:
  - AWS Bedrock (Llama 3.2 90B)
  - SambaNova (Llama 4 Maverick 17B)
- **Video Processing**: Canvas API for frame capture and analysis
- **Internationalization**: next-intl

### Project Structure

```
crowded/
├── app/
│   └── [locale]/
│       ├── page.tsx              # Homepage with navigation
│       ├── status/page.tsx       # Carriage status screen (main app)
│       ├── live-feed/page.tsx    # Multi-station live feeds
│       └── lines/page.tsx        # Metro lines overview
├── components/
│   ├── VideoAnalyzer.tsx         # Video analysis component
│   └── LanguageSwitcher.tsx      # Language toggle
├── lib/
│   ├── analyzer.ts               # Multi-provider orchestration
│   ├── actions.ts                # Server actions
│   └── providers/
│       ├── base.ts               # Abstract provider class
│       ├── sambanova.ts          # SambaNova implementation
│       ├── bedrock.ts            # AWS Bedrock implementation
│       └── README.md             # Provider architecture docs
├── public/
│   └── train-videos/
│       ├── 1/video_60.mp4        # Carriage 1 video
│       ├── 2/video_100.mp4       # Carriage 2 video
│       └── ...                   # Videos for each carriage
└── messages/
    ├── en.json                   # English translations
    └── ja.json                   # Japanese translations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- API keys for at least one AI provider

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crowded
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.local.example` to `.env.local` and configure:

   ```bash
   # AI Provider Selection
   AI_PROVIDER="bedrock"              # Primary: 'bedrock' or 'sambanova'
   AI_FALLBACK_PROVIDER="sambanova"   # Fallback if primary fails

   # SambaNova AI Provider (supports multiple keys for rotation)
   SAMBANOVA_API_KEY="your-key-1"
   SAMBANOVA_API_KEY_2="your-key-2"
   SAMBANOVA_API_KEY_3="your-key-3"
   SAMBANOVA_AI_MODEL="Llama-4-Maverick-17B-128E-Instruct"

   # AWS Bedrock Provider
   AWS_BEDROCK_AI_MODEL="us.meta.llama3-2-90b-instruct-v1:0"
   AWS_DEFAULT_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_SESSION_TOKEN="your-session-token"  # Optional
   ```

4. **Add train videos**

   Place your carriage videos in the appropriate directories:
   ```
   public/train-videos/
   ├── 1/video_60.mp4
   ├── 2/video_100.mp4
   ├── 3/video_120.mp4
   ├── 4/video_150.mp4
   └── 5/video_40.mp4
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Carriage Status Screen (`/status`)

1. The default view shows 5 train carriages with their current congestion status
2. Click on any carriage to load its video
3. Video automatically plays in loop
4. AI analysis runs automatically every 5 seconds
5. Carriage status and capacity update in real-time based on analysis results

### Multi-Station Live Feed (`/live-feed`)

- View random selection of 3-4 station feeds simultaneously
- All feeds analyze in real-time
- Click on any feed to expand and focus

## 🤖 AI Provider System

### Multi-Provider Architecture

The application uses a robust provider system with automatic fallback:

```
Primary Provider (Bedrock)
    ↓ (if fails)
Fallback Provider (SambaNova)
    ↓ (if fails)
Additional Providers
    ↓ (if all fail)
Safe Default Result
```

### API Key Rotation (SambaNova)

SambaNova provider automatically rotates through multiple API keys:
- Prevents rate limiting
- Distributes load across keys
- Round-robin rotation strategy

### Adding New Providers

See `lib/providers/README.md` for detailed instructions on adding new AI providers.

## 🔧 Configuration

### Switching AI Providers

**Use Bedrock as primary:**
```bash
AI_PROVIDER="bedrock"
AI_FALLBACK_PROVIDER="sambanova"
```

**Use SambaNova as primary:**
```bash
AI_PROVIDER="sambanova"
AI_FALLBACK_PROVIDER="bedrock"
```

### Customizing Models

Override default models via environment variables:
```bash
SAMBANOVA_AI_MODEL="Llama-4-Scout-17B-16E-Instruct"
AWS_BEDROCK_AI_MODEL="us.meta.llama3-2-11b-instruct-v1:0"
```

### Analysis Interval

Modify the analysis frequency in the component:
```tsx
<VideoAnalyzer
  intervalMs={3000}  // Analyze every 3 seconds
  autoStart={true}
/>
```

## 📊 Analysis Output

Each analysis returns:
```typescript
{
  status: 'empty' | 'few people' | 'moderate' | 'full',
  capacity: number,      // 0-150%
  confidence: number,    // 0-100%
  reasoning: string      // AI explanation
}
```

### Status Mapping
- **Empty**: 0-25% capacity (green)
- **Few People**: 25-50% capacity (blue)
- **Moderate**: 50-85% capacity (yellow)
- **Full**: 85-100%+ capacity (red)

## 🛠️ Development

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Run linting
```bash
npm run lint
```

## 🐛 Debugging

### Check Provider Configuration
```typescript
import { getProviderInfo } from '@/lib/analyzer';

const info = getProviderInfo();
console.log('Primary:', info.primary);        // "bedrock"
console.log('Fallback:', info.fallback);      // "sambanova"
console.log('Available:', info.available);    // Array of provider info
console.log('Total:', info.total);            // 2
```

### Test All Providers
```typescript
import { testProviders } from '@/lib/analyzer';

const results = await testProviders('https://example.com/test-image.jpg');
// Returns success/failure for each provider
```

### Console Logs

The application provides detailed logging:
- `[Analyzer]` - Provider initialization and fallback logic
- `[AWS Bedrock]` / `[SambaNova]` - Individual provider operations
- `[VideoAnalyzer]` - Video loading and frame capture
- `[Status]` - UI state updates

## 🌐 Internationalization

Supports English and Japanese. Add more languages by:

1. Add language file in `messages/` (e.g., `messages/fr.json`)
2. Update `i18n/routing.ts`:
   ```typescript
   locales: ['en', 'ja', 'fr'],
   ```

## 📝 API Reference

### Server Actions

**`analyzeImage(imageUrl: string)`**
- Analyzes a single image (URL or base64 data URL)
- Returns `AnalysisResult`
- Automatically handles provider selection and fallback

### Components

**`<VideoAnalyzer>`**
- Props:
  - `onAnalysis`: Callback when analysis completes
  - `videoUrl`: URL to video file (optional)
  - `intervalMs`: Analysis interval in milliseconds (default: 5000)
  - `autoStart`: Auto-start analysis when video loads (default: false)

## 🔒 Security

- API keys stored in `.env.local` (never committed)
- Server-side only AI provider execution
- No client-side API key exposure

## 📄 License

[Your License Here]

## 🤝 Contributing

[Contributing guidelines if applicable]

## 📞 Support

For issues and questions, please [open an issue](https://github.com/your-repo/issues).

---

**Built with LLM technology for intelligent crowd analysis** 🤖
