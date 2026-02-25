import asyncio
import asyncpg
import sys

async def test_connection():
    try:
        conn = await asyncpg.connect(
            user='smartcart',
            password='smartcart123',
            database='smartcart',
            host='127.0.0.1',
            port=5432
        )
        print("Connection successful!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_connection())