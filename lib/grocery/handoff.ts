import { buildProviderCartItems, buildProviderSearchUrl, buildSingleItemSearchUrl } from '@/lib/grocery/comparison'
import { getProvider } from '@/lib/grocery/providers/registry'
import type { CartHandoffMode, CommerceConfidence, ProviderCartItem, ProviderId } from '@/lib/grocery/types'
import type { GroceryList } from '@/lib/planner/types'

const DIRECT_HANDOFF_LIMIT = 12

export type GroceryHandoffResult = {
  providerId: ProviderId
  providerName: string
  url: string
  itemCount: number
  mode: 'multi_item_search' | 'single_item_fallback'
  cartHandoffMode: CartHandoffMode
  pricingConfidence: CommerceConfidence
  availabilityConfidence: CommerceConfidence
  retailerPayload: {
    providerId: ProviderId
    items: ProviderCartItem[]
    estimatedSubtotal: number
    fallbackText: string
  }
  nextBestAction: string
  cartItems: ProviderCartItem[]
}

export function buildGroceryHandoff(
  groceryList: GroceryList,
  providerId: ProviderId,
): GroceryHandoffResult {
  const provider = getProvider(providerId)
  if (!provider) {
    throw new Error(`Unsupported grocery provider: ${providerId}`)
  }

  const cartItems = buildProviderCartItems(groceryList)
  if (cartItems.length === 0) {
    throw new Error('No missing grocery items to hand off')
  }

  const mode = cartItems.length > DIRECT_HANDOFF_LIMIT
    ? 'single_item_fallback'
    : 'multi_item_search'
  const url = mode === 'single_item_fallback'
    ? buildSingleItemSearchUrl(provider, cartItems[0])
    : buildProviderSearchUrl(provider, cartItems)

  return {
    providerId,
    providerName: provider.displayName,
    url,
    itemCount: cartItems.length,
    mode,
    cartHandoffMode: provider.cartHandoffMode,
    pricingConfidence: provider.pricingConfidence,
    availabilityConfidence: provider.availabilityConfidence,
    retailerPayload: {
      providerId,
      items: cartItems,
      estimatedSubtotal: groceryList.totalEstimatedCost ?? 0,
      fallbackText: buildFallbackListText(cartItems),
    },
    nextBestAction: getNextBestAction(provider.cartHandoffMode, provider.displayName),
    cartItems,
  }
}

function buildFallbackListText(items: ProviderCartItem[]): string {
  return items
    .map((item) => {
      const quantity = item.quantity > 0 ? `${item.quantity} ${item.unit}`.trim() : ''
      return quantity ? `${item.name} — ${quantity}` : item.name
    })
    .join('\n')
}

function getNextBestAction(mode: CartHandoffMode, providerName: string): string {
  if (mode === 'cart_api') return `Review the prepared ${providerName} cart`
  if (mode === 'multi_item_search') return `Open ${providerName} with the list search and paste the backup list if needed`
  return `Open ${providerName} for the first missing item and use the backup list for the rest`
}
