# **🍷Mooncl — The Opinion NFT Launchpad**

Turn opinions into on-chain assets. Publish a take, our AI scores it to set the initial price, mint as an NFT, and let market demand move the price. Mooncl is a Web3 launchpad for opinion pricing and discovery, with market browsing, detail views, publishing/minting, and essential wallet interactions.

# **Features**

- Opinion-to-NFT launchpad: publish a take, mint it as an NFT, and trade it on-chain.
- AI-scored initial pricing: an AI score sets the starting price; subsequent buys drive dynamic price discovery.
- Market browsing: ranking list with pagination; open item detail in a modal.
- NFT detail: price, creator address, and content with a consistent glass UI.
- Publish flow: large textarea input, mint action, loading state, and AI score result screen.
- URL-driven modals: ?modal=market|publish|detail&nft={id} for deep links and clean navigation.
- Wallet UI: network and account controls using Reown AppKit with custom glass styling.
- Balance and address display: short address plus live balance (via wagmi).
- Reusable design system: tokens (CSS variables), atomic UI components, and composable modal/layout components.
- Responsive layout and consistent animations, hover states, and button variants (brand/glass).

# **Tech Stack**

- Next.js (App Router), React, TypeScript
- Tailwind CSS with design tokens (CSS variables)
- wagmi for account and balance
- Reown AppKit for network/account panels
- Fetch-based API integration for opinions:
    - GET /api/v1/opinions/ranking
    - GET /api/v1/opinions/detail/{opinion_id}