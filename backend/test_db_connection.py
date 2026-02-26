import asyncio
import sys

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_connection():
    try:
        # Use as configurações feitas na database
        engine = create_async_engine(settings.DATABASE_URL, echo=True)
        
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("Connection successful! Configured DATABASE_URL is reachable.")
            
        await engine.dispose()
    except Exception as e:
        print(f"Connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_connection())