# Tibia Discord Bot

A Discord bot that automatically tracks and posts daily boosted creatures and bosses from the MMORPG Tibia, with a web dashboard for monitoring and configuration.

## Features

### Discord Bot
- **Automatic Updates**: Posts daily boosted creatures and bosses at 10:06 CEST (6 minutes after server save)
- **Smart Detection**: Only posts when changes occur to prevent spam
- **Slash Commands**:
  - `/update` - Manually trigger creature/boss update
  - `/creature` - Show current boosted creature
  - `/boss` - Show current boosted boss  
  - `/next` - Show time until next update
- **Rich Embeds**: Beautiful Discord messages with creature images and stats
- **Fallback System**: Multiple data sources ensure reliability

### Web Dashboard
- **Real-time Monitoring**: Live bot status and performance metrics
- **Creature Tracking**: View boosted creatures history and details
- **Configuration**: Manage bot settings and channel assignments
- **API Testing**: Test TibiaData API endpoints and view responses
- **Logs**: Monitor bot activity and troubleshoot issues

### Technical Features
- **TibiaData API v4**: Latest API integration with proper error handling
- **Change Detection**: Compares data to avoid duplicate posts
- **Timezone Support**: Proper CEST/CET handling for Tibia server times
- **Error Recovery**: Robust retry mechanisms and fallback data sources
- **Performance Monitoring**: Response times, success rates, uptime tracking

## Railway Deployment

### Required Environment Variables

Set these in your Railway dashboard:

1. **DISCORD_TOKEN** - Your Discord bot token
2. **CREATURE_CHANNEL_ID** - Channel ID for creature updates
3. **BOSS_CHANNEL_ID** - Channel ID for boss updates

### Getting Your Values

#### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application or select existing one
3. Go to "Bot" section and copy the token

#### Channel IDs
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click the channel where you want updates
3. Select "Copy Channel ID"

### Deployment Steps

1. **Fork/Clone**: Get the code to your GitHub repository
2. **Connect Railway**: Link your repository to Railway
3. **Environment Variables**: Add the 3 required variables in Railway dashboard
4. **Deploy**: Railway automatically builds and deploys using the configuration files

### Bot Permissions

Your Discord bot needs these permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Attach Files
- Read Message History

## Project Structure

```
├── client/                 # React frontend dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, creatures, configuration pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API client
│   └── index.html
├── server/                # Express.js API server
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Data persistence layer
│   └── vite.ts           # Frontend integration
├── shared/
│   └── schema.ts         # Shared TypeScript types
├── railway.toml          # Railway deployment config
├── nixpacks.toml         # Build optimization
└── package.json          # Dependencies and scripts
```

## Development

### Local Setup
```bash
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking

## API Endpoints

The web dashboard exposes these API endpoints:

- `GET /api/bot/status` - Bot status and metrics
- `GET /api/bot/logs` - Recent bot activity logs
- `GET /api/creatures/boosted` - Current and recent boosted creatures
- `GET /api/tests` - TibiaData API test results
- `POST /api/bot/update` - Trigger manual update

## Configuration

### Bot Behavior
- **Update Schedule**: 10:06 and 10:36 CEST daily (backup check)
- **API Timeout**: 10 seconds for TibiaData requests
- **Rate Limiting**: Respects Discord and TibiaData API limits
- **Retry Logic**: 3 attempts with exponential backoff

### Data Sources
1. **Primary**: TibiaData API v4 (`/v4/creatures`)
2. **Fallback**: TibiaWiki for creature images
3. **Cache**: In-memory storage for change detection

## Monitoring

### Dashboard Metrics
- Bot online status and uptime
- API response times and success rates
- Daily post counts
- Last successful updates
- Error logs and debugging info

### Health Checks
The `/api/bot/status` endpoint provides comprehensive health monitoring for external services.

## Troubleshooting

### Common Issues

**Bot not posting updates:**
- Check environment variables are set correctly
- Verify bot has proper Discord permissions
- Check logs in dashboard for API errors

**API failures:**
- TibiaData API may be temporarily down
- Check network connectivity
- Verify API endpoint URLs are current

**Time zone issues:**
- Bot uses CEST/CET for Tibia server times
- Updates trigger at 10:06 server time (after daily server save)

### Support
- Check the web dashboard logs for detailed error information
- Verify all environment variables are properly set
- Ensure Discord bot has necessary permissions in target channels

## License

MIT License - Feel free to modify and redistribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Built with ❤️ for the Tibia community.