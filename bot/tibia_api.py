import asyncio
import logging
from typing import Dict, Optional, Any
import aiohttp
import re
import json

logger = logging.getLogger(__name__)

class TibiaAPI:
    """Interface for TibiaData API v4"""
    
    BASE_URL = "https://api.tibiadata.com/v4"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.timeout = aiohttp.ClientTimeout(total=30)
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
            self.session = aiohttp.ClientSession(
                connector=connector,
                timeout=self.timeout,
                headers={
                    'User-Agent': 'TibiaDiscordBot/1.0',
                    'Accept': 'application/json'
                }
            )
        return self.session
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, retries: int = 3) -> Optional[Dict[str, Any]]:
        """
        Make HTTP request to TibiaData API
        
        Args:
            endpoint: API endpoint path
            retries: Number of retry attempts
            
        Returns:
            JSON response data or None if failed
        """
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        
        for attempt in range(retries + 1):
            try:
                session = await self._get_session()
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    elif response.status == 429:  # Rate limited
                        wait_time = 2 ** attempt
                        logger.warning(f"Rate limited. Waiting {wait_time}s before retry {attempt + 1}")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"API request failed with status {response.status}: {url}")
                        
            except asyncio.TimeoutError:
                logger.error(f"Request timeout for {url} (attempt {attempt + 1})")
            except aiohttp.ClientError as e:
                logger.error(f"Client error for {url}: {e} (attempt {attempt + 1})")
            except Exception as e:
                logger.error(f"Unexpected error for {url}: {e} (attempt {attempt + 1})")
            
            if attempt < retries:
                wait_time = 2 ** attempt
                await asyncio.sleep(wait_time)
        
        logger.error(f"Failed to fetch data from {url} after {retries + 1} attempts")
        return None
    
    async def get_boosted_creatures(self) -> Optional[Dict[str, str]]:
        """
        Get current boosted creature and boss
        
        Returns:
            Dict with 'boosted_creature' and 'boosted_boss' keys, or None if failed
        """
        try:
            # Get boosted creatures data
            creatures_data = await self._make_request("creatures")
            
            boosted_creature = None
            if creatures_data and 'creatures' in creatures_data:
                creatures_info = creatures_data['creatures']
                if 'boosted' in creatures_info and creatures_info['boosted']:
                    boosted_creature = creatures_info['boosted']['name']
            
            # Get boostable bosses data
            bosses_data = await self._make_request("boostablebosses")
            
            boosted_boss = None
            if bosses_data and 'boostable_bosses' in bosses_data:
                bosses_info = bosses_data['boostable_bosses']
                if 'boosted' in bosses_info and bosses_info['boosted']:
                    boosted_boss = bosses_info['boosted']['name']
            
            if boosted_creature or boosted_boss:
                result = {
                    'boosted_creature': boosted_creature,
                    'boosted_boss': boosted_boss,
                    'timestamp': creatures_data.get('information', {}).get('timestamp') if creatures_data else None
                }
                logger.info(f"Fetched boosted data: creature={boosted_creature}, boss={boosted_boss}")
                return result
            else:
                logger.warning("No boosted creature or boss found in API response")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching boosted creatures: {e}")
            return None
    
    async def get_creature_details(self, creature_name: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific creature
        First tries TibiaData API, then falls back to TibiaWiki scraping
        
        Args:
            creature_name: Name of the creature
            
        Returns:
            Creature details dict or None if not found
        """
        if not creature_name:
            return None
            
        try:
            # First try TibiaData API
            formatted_name = creature_name.replace(' ', '_').lower()
            data = await self._make_request(f"creature/{formatted_name}")
            
            if data and 'creature' in data:
                creature_info = data['creature']
                logger.info(f"Fetched details for creature from TibiaData: {creature_name}")
                return creature_info
            else:
                # Fallback to TibiaWiki scraping
                logger.info(f"TibiaData failed, trying TibiaWiki for: {creature_name}")
                return await self._scrape_tibiawiki_creature(creature_name)
                
        except Exception as e:
            logger.error(f"Error fetching creature details for {creature_name}: {e}")
            return await self._scrape_tibiawiki_creature(creature_name)
    
    async def _scrape_tibiawiki_creature(self, creature_name: str) -> Optional[Dict[str, Any]]:
        """
        Scrape creature information from TibiaWiki as fallback
        
        Args:
            creature_name: Name of the creature
            
        Returns:
            Creature details dict or None if not found
        """
        try:
            # Format creature name for TibiaWiki URL
            wiki_name = creature_name.replace(' ', '_')
            wiki_url = f"https://tibia.fandom.com/wiki/{wiki_name}"
            
            session = await self._get_session()
            async with session.get(wiki_url) as response:
                if response.status == 200:
                    html = await response.text()
                    
                    # Parse basic creature info from TibiaWiki
                    creature_info = self._parse_tibiawiki_html(html, creature_name)
                    
                    if creature_info:
                        logger.info(f"Scraped creature info from TibiaWiki: {creature_name}")
                        return creature_info
                    else:
                        logger.warning(f"Could not parse TibiaWiki data for: {creature_name}")
                        return self._create_fallback_creature_info(creature_name)
                else:
                    logger.warning(f"TibiaWiki returned status {response.status} for: {creature_name}")
                    return self._create_fallback_creature_info(creature_name)
                    
        except Exception as e:
            logger.error(f"Error scraping TibiaWiki for {creature_name}: {e}")
            return self._create_fallback_creature_info(creature_name)
    
    def _parse_tibiawiki_html(self, html: str, creature_name: str) -> Optional[Dict[str, Any]]:
        """
        Parse creature information from TibiaWiki HTML
        
        Args:
            html: HTML content from TibiaWiki
            creature_name: Name of the creature
            
        Returns:
            Parsed creature information
        """
        try:
            # Extract basic stats using regex patterns
            hp_match = re.search(r'Hit Points.*?(\d+)', html, re.IGNORECASE)
            exp_match = re.search(r'Experience.*?(\d+)', html, re.IGNORECASE)
            
            # Extract description from the first paragraph
            desc_match = re.search(r'<p.*?>(.*?)</p>', html, re.DOTALL)
            
            # Clean up description
            description = ""
            if desc_match:
                desc_text = desc_match.group(1)
                # Remove HTML tags
                desc_text = re.sub(r'<[^>]+>', '', desc_text)
                # Clean up whitespace
                desc_text = re.sub(r'\s+', ' ', desc_text).strip()
                if len(desc_text) > 50:  # Only use if it's substantial
                    description = desc_text[:200] + "..." if len(desc_text) > 200 else desc_text
            
            creature_info = {
                'name': creature_name,
                'hitpoints': int(hp_match.group(1)) if hp_match else 'Unknown',
                'experience_points': int(exp_match.group(1)) if exp_match else 'Unknown',
                'description': description or f"Information about {creature_name}",
                'source': 'TibiaWiki'
            }
            
            return creature_info
            
        except Exception as e:
            logger.error(f"Error parsing TibiaWiki HTML for {creature_name}: {e}")
            return None
    
    def _create_fallback_creature_info(self, creature_name: str) -> Dict[str, Any]:
        """
        Create basic fallback creature information when all sources fail
        
        Args:
            creature_name: Name of the creature
            
        Returns:
            Basic creature information dict
        """
        return {
            'name': creature_name,
            'hitpoints': 'Unknown',
            'experience_points': 'Unknown',
            'description': f"Today's boosted creature: {creature_name}. Enjoy 2x experience and loot!",
            'source': 'Fallback'
        }
    
    async def get_all_creatures(self) -> Optional[Dict[str, Any]]:
        """
        Get list of all creatures (for reference/debugging)
        
        Returns:
            All creatures data or None if failed
        """
        try:
            data = await self._make_request("creatures")
            
            if data and 'creatures' in data:
                logger.info("Fetched all creatures list")
                return data['creatures']
            else:
                logger.warning("Failed to fetch creatures list")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching all creatures: {e}")
            return None
    
    def format_hp(self, hp_value: Any) -> str:
        """Format HP value for display"""
        if isinstance(hp_value, (int, float)):
            return f"{int(hp_value):,}"
        elif isinstance(hp_value, str) and hp_value.isdigit():
            return f"{int(hp_value):,}"
        else:
            return str(hp_value) if hp_value else "Unknown"
    
    def format_experience(self, exp_value: Any) -> str:
        """Format experience value for display"""
        if isinstance(exp_value, (int, float)):
            return f"{int(exp_value):,}"
        elif isinstance(exp_value, str) and exp_value.isdigit():
            return f"{int(exp_value):,}"
        else:
            return str(exp_value) if exp_value else "Unknown"
    
    def get_creature_image_url(self, creature_name: str) -> str:
        """
        Get creature image URL from TibiaWiki
        
        Args:
            creature_name: Name of the creature
            
        Returns:
            Image URL string
        """
        if not creature_name:
            return ""
        
        # Format name for TibiaWiki (replace spaces with underscores)
        formatted_name = creature_name.replace(' ', '_')
        
        # TibiaWiki image URL pattern
        return f"https://tibia.fandom.com/wiki/Special:Redirect/file/{formatted_name}.gif"
    
    async def __aenter__(self):
        """Async context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
