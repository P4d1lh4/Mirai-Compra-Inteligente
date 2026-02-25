"""Seed database with realistic São Paulo supermarket data."""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.models import (
    Base, Category, Product, StoreChain, Store, PriceEntry, Flyer, FlyerItem,
)
from unidecode import unidecode


def normalize(name: str) -> str:
    return unidecode(name.lower().strip())


async def seed():
    async with AsyncSessionLocal() as db:
        # Check if data exists
        result = await db.execute(text("SELECT count(*) FROM store_chains"))
        count = result.scalar()
        if count and count > 0:
            print("Database already seeded. Skipping.")
            return

        now = datetime.now(timezone.utc)

        # ─── CATEGORIES ───
        categories = {}
        cat_data = [
            ("Mercearia", "mercearia", "🛒"),
            ("Bebidas", "bebidas", "🥤"),
            ("Carnes e Aves", "carnes", "🥩"),
            ("Laticínios", "laticinios", "🧀"),
            ("Hortifrúti", "hortifruti", "🥬"),
            ("Padaria", "padaria", "🍞"),
            ("Limpeza", "limpeza", "🧹"),
            ("Higiene e Beleza", "higiene", "🧴"),
            ("Congelados", "congelados", "🧊"),
            ("Pet Shop", "pet-shop", "🐶"),
        ]
        for name, slug, icon in cat_data:
            cat = Category(name=name, slug=slug, icon=icon)
            db.add(cat)
            categories[slug] = cat
        await db.flush()

        # ─── STORE CHAINS ───
        chains = {}
        chain_data = [
            ("Atacadão", "atacadao", "#FF6600", True, "https://www.atacadao.com.br"),
            ("Assaí Atacadista", "assai", "#003399", True, "https://www.assai.com.br"),
            ("Carrefour", "carrefour", "#004F9F", True, "https://www.carrefour.com.br"),
            ("Pão de Açúcar", "pao-de-acucar", "#E4002B", True, "https://www.paodeacucar.com"),
            ("Extra", "extra", "#E31837", True, "https://www.extra.com.br"),
            ("São Vicente", "sao-vicente", "#008C45", False, "https://www.svicente.com.br"),
            ("Sonda Supermercados", "sonda", "#0066CC", False, "https://www.sfrota.com.br"),
            ("Dia Supermercados", "dia", "#D50032", True, "https://www.dia.com.br"),
        ]
        for name, slug, color, ecom, url in chain_data:
            chain = StoreChain(
                name=name, slug=slug, color_hex=color,
                has_ecommerce=ecom, website_url=url,
                logo_url=f"/logos/{slug}.svg",
            )
            db.add(chain)
            chains[slug] = chain
        await db.flush()

        # ─── STORES (São Paulo) ───
        stores = {}
        store_data = [
            # (chain_slug, name, address, city, state, zip, lat, lng)
            ("atacadao", "Atacadão Aricanduva", "Av. Aricanduva, 5555", "São Paulo", "SP", "03527-900", -23.5614, -46.5097),
            ("atacadao", "Atacadão Santo Amaro", "Av. Santo Amaro, 7500", "São Paulo", "SP", "04556-000", -23.6352, -46.6652),
            ("assai", "Assaí Marginal Tietê", "Av. Marginal Tietê, 8100", "São Paulo", "SP", "02040-001", -23.5200, -46.6500),
            ("assai", "Assaí Guarulhos", "Rod. Pres. Dutra km 224", "Guarulhos", "SP", "07034-000", -23.4628, -46.5333),
            ("carrefour", "Carrefour Pinheiros", "Av. Nações Unidas, 4500", "São Paulo", "SP", "05477-000", -23.5675, -46.6952),
            ("carrefour", "Carrefour Tatuapé", "R. Tuiuti, 2430", "São Paulo", "SP", "03307-000", -23.5422, -46.5756),
            ("pao-de-acucar", "Pão de Açúcar Itaim Bibi", "R. João Cachoeira, 899", "São Paulo", "SP", "04535-012", -23.5827, -46.6775),
            ("pao-de-acucar", "Pão de Açúcar Vila Mariana", "R. Domingos de Morais, 2564", "São Paulo", "SP", "04036-100", -23.5950, -46.6364),
            ("extra", "Extra Anália Franco", "Av. Regente Feijó, 1739", "São Paulo", "SP", "03342-000", -23.5561, -46.5689),
            ("sao-vicente", "São Vicente Interlagos", "Av. Interlagos, 3200", "São Paulo", "SP", "04660-000", -23.6800, -46.6750),
            ("sonda", "Sonda Moema", "Av. Moema, 400", "São Paulo", "SP", "04077-020", -23.6020, -46.6650),
            ("dia", "Dia Vila Madalena", "R. Mourato Coelho, 1050", "São Paulo", "SP", "05417-001", -23.5530, -46.6900),
        ]
        for chain_slug, name, addr, city, state, zip_code, lat, lng in store_data:
            store = Store(
                chain_id=chains[chain_slug].id,
                name=name, address=addr, city=city, state=state,
                zip_code=zip_code, latitude=lat, longitude=lng,
            )
            db.add(store)
            stores[name] = store
        await db.flush()

        # ─── PRODUCTS ───
        products = {}
        product_data = [
            # (name, brand, ean, category_slug, unit, image)
            ("Azeite Extra Virgem 500ml", "Gallo", "5601012010100", "mercearia", "500ml", "/products/azeite-gallo.jpg"),
            ("Arroz Agulhinha Tipo 1 5kg", "Tio João", "7893500020110", "mercearia", "5kg", "/products/arroz-tiojoao.jpg"),
            ("Feijão Carioca Tipo 1 1kg", "Camil", "7896006750123", "mercearia", "1kg", "/products/feijao-camil.jpg"),
            ("Açúcar Cristal 5kg", "União", "7891910000197", "mercearia", "5kg", "/products/acucar-uniao.jpg"),
            ("Café Torrado e Moído 500g", "Melitta", "7891107001007", "mercearia", "500g", "/products/cafe-melitta.jpg"),
            ("Óleo de Soja 900ml", "Liza", "7891107052009", "mercearia", "900ml", "/products/oleo-liza.jpg"),
            ("Macarrão Espaguete 500g", "Barilla", "8076809523578", "mercearia", "500g", "/products/macarrao-barilla.jpg"),
            ("Molho de Tomate 340g", "Heinz", "7896102502015", "mercearia", "340g", "/products/molho-heinz.jpg"),
            ("Sal Refinado 1kg", "Cisne", "7896035221113", "mercearia", "1kg", "/products/sal-cisne.jpg"),
            ("Farinha de Trigo 1kg", "Dona Benta", "7896005212318", "mercearia", "1kg", "/products/farinha-donabenta.jpg"),

            # Bebidas
            ("Coca-Cola 2L", "Coca-Cola", "7894900010015", "bebidas", "2L", "/products/coca-cola-2l.jpg"),
            ("Cerveja Pilsen 350ml (lata)", "Brahma", "7891149100101", "bebidas", "350ml", "/products/brahma-lata.jpg"),
            ("Água Mineral 1.5L", "Crystal", "7894900530018", "bebidas", "1.5L", "/products/agua-crystal.jpg"),
            ("Suco de Laranja 1L", "Del Valle", "7894900600018", "bebidas", "1L", "/products/suco-delvalle.jpg"),
            ("Cerveja IPA 355ml", "Colorado", "7898377660018", "bebidas", "355ml", "/products/colorado-ipa.jpg"),

            # Carnes
            ("Peito de Frango Congelado 1kg", "Sadia", "7893000392014", "carnes", "1kg", "/products/frango-sadia.jpg"),
            ("Coxão Mole Bovino 1kg", "Friboi", "7896001110013", "carnes", "1kg", "/products/coxao-mole.jpg"),
            ("Linguiça Toscana 1kg", "Perdigão", "7891515408015", "carnes", "1kg", "/products/linguica-perdigao.jpg"),
            ("Costela Bovina 1kg", "Swift", "7896000201010", "carnes", "1kg", "/products/costela.jpg"),

            # Laticínios
            ("Leite Integral UHT 1L", "Ninho", "7891000100103", "laticinios", "1L", "/products/leite-ninho.jpg"),
            ("Queijo Mussarela Fatiado 200g", "Tirolez", "7896037510015", "laticinios", "200g", "/products/mussarela-tirolez.jpg"),
            ("Iogurte Natural 170g", "Nestlé", "7891000012345", "laticinios", "170g", "/products/iogurte-nestle.jpg"),
            ("Manteiga com Sal 200g", "Aviação", "7896036090015", "laticinios", "200g", "/products/manteiga-aviacao.jpg"),
            ("Creme de Leite 200g", "Nestlé", "7891000012001", "laticinios", "200g", "/products/creme-nestle.jpg"),

            # Limpeza
            ("Sabão em Pó 1.6kg", "Omo", "7891150026698", "limpeza", "1.6kg", "/products/omo.jpg"),
            ("Detergente Líquido 500ml", "Ypê", "7896098900017", "limpeza", "500ml", "/products/detergente-ype.jpg"),
            ("Desinfetante Lavanda 2L", "Pinho Sol", "7891024114018", "limpeza", "2L", "/products/pinhosol.jpg"),
            ("Papel Higiênico Folha Dupla 12un", "Neve", "7896018702912", "limpeza", "12un", "/products/neve.jpg"),
            ("Amaciante de Roupas 2L", "Comfort", "7891150045200", "limpeza", "2L", "/products/comfort.jpg"),

            # Higiene
            ("Sabonete em Barra 90g", "Dove", "7891150019577", "higiene", "90g", "/products/dove.jpg"),
            ("Shampoo 400ml", "Pantene", "7500435107594", "higiene", "400ml", "/products/pantene.jpg"),
            ("Pasta de Dente 90g", "Colgate", "7891024132104", "higiene", "90g", "/products/colgate.jpg"),
            ("Desodorante Aerossol 150ml", "Rexona", "7891150044432", "higiene", "150ml", "/products/rexona.jpg"),
        ]

        for name, brand, ean, cat_slug, unit, image in product_data:
            product = Product(
                name=name,
                normalized_name=normalize(f"{name} {brand}"),
                brand=brand,
                ean=ean,
                category_id=categories[cat_slug].id,
                unit=unit,
                image_url=image,
            )
            db.add(product)
            products[name] = product
        await db.flush()

        # ─── PRICES ───
        # Generate realistic prices across stores
        import random
        random.seed(42)

        store_list = list(stores.values())
        for prod_name, product in products.items():
            # Each product available at 4-8 random stores
            num_stores = random.randint(4, min(8, len(store_list)))
            selected_stores = random.sample(store_list, num_stores)

            base_price = _get_base_price(prod_name)

            for store in selected_stores:
                chain = chains[next(
                    slug for slug, c in chains.items() if c.id == store.chain_id
                )]
                # Atacadistas are ~15% cheaper
                is_atacado = chain.slug in ("atacadao", "assai")
                multiplier = random.uniform(0.82, 0.95) if is_atacado else random.uniform(0.95, 1.15)
                price = round(base_price * multiplier, 2)

                # 30% chance of being on promotion
                is_promo = random.random() < 0.3
                original_price = None
                promo_label = None
                if is_promo:
                    original_price = round(price * random.uniform(1.1, 1.3), 2)
                    promo_label = random.choice([
                        "Oferta da Semana", "Preço Baixo", "Aproveite!",
                        "Só Hoje!", "Economize", "Super Oferta",
                    ])

                # Online availability
                is_online = chain.has_ecommerce and random.random() < 0.6
                ecom_url = f"{chain.website_url or ''}/produto/{product.ean}" if is_online else None

                entry = PriceEntry(
                    product_id=product.id,
                    store_id=store.id,
                    price=price,
                    original_price=original_price,
                    is_promotion=is_promo,
                    promotion_label=promo_label,
                    is_online=is_online,
                    ecommerce_url=ecom_url,
                    is_current=True,
                    valid_from=now - timedelta(days=1),
                    valid_until=now + timedelta(days=6),
                    source="seed",
                    seen_at=now,
                )
                db.add(entry)

            # Also add some historical prices (for price history feature)
            for days_ago in [7, 14, 21, 28]:
                for store in random.sample(selected_stores, min(3, len(selected_stores))):
                    historical_price = round(base_price * random.uniform(0.85, 1.20), 2)
                    entry = PriceEntry(
                        product_id=product.id,
                        store_id=store.id,
                        price=historical_price,
                        is_current=False,
                        source="seed",
                        seen_at=now - timedelta(days=days_ago),
                    )
                    db.add(entry)

        # ─── FLYERS ───
        for chain_slug, chain in chains.items():
            flyer = Flyer(
                chain_id=chain.id,
                title=f"Ofertas da Semana - {chain.name}",
                image_url=f"/flyers/{chain_slug}-capa.jpg",
                valid_from=now - timedelta(days=1),
                valid_until=now + timedelta(days=6),
                is_active=True,
            )
            db.add(flyer)
            await db.flush()

            # Add 5-8 products to each flyer
            flyer_products = random.sample(list(products.values()), random.randint(5, 8))
            for prod in flyer_products:
                base = _get_base_price(prod.name)
                promo_price = round(base * random.uniform(0.7, 0.9), 2)
                fi = FlyerItem(
                    flyer_id=flyer.id,
                    product_id=prod.id,
                    raw_name=prod.name,
                    price=promo_price,
                    original_price=round(base, 2),
                    image_url=prod.image_url,
                )
                db.add(fi)

        await db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - {len(categories)} categories")
        print(f"   - {len(chains)} store chains")
        print(f"   - {len(stores)} stores")
        print(f"   - {len(products)} products")
        print(f"   - Prices and flyers generated")


def _get_base_price(product_name: str) -> float:
    """Return a realistic base price in BRL for a product name."""
    price_map = {
        "Azeite": 29.90, "Arroz": 27.90, "Feijão": 8.49, "Açúcar": 22.90,
        "Café": 19.90, "Óleo": 8.99, "Macarrão": 7.49, "Molho": 6.99,
        "Sal": 3.49, "Farinha": 5.99,
        "Coca-Cola": 9.99, "Cerveja Pilsen": 3.29, "Água": 2.99,
        "Suco": 7.49, "Cerveja IPA": 12.90,
        "Peito de Frango": 15.90, "Coxão Mole": 42.90, "Linguiça": 24.90,
        "Costela": 34.90,
        "Leite": 5.99, "Queijo": 12.90, "Iogurte": 4.49, "Manteiga": 11.90,
        "Creme de Leite": 4.99,
        "Sabão": 18.90, "Detergente": 2.99, "Desinfetante": 9.90,
        "Papel Higiênico": 19.90, "Amaciante": 14.90,
        "Sabonete": 3.49, "Shampoo": 22.90, "Pasta de Dente": 7.49,
        "Desodorante": 14.90,
    }
    for key, price in price_map.items():
        if key.lower() in product_name.lower():
            return price
    return 10.00


if __name__ == "__main__":
    asyncio.run(seed())
