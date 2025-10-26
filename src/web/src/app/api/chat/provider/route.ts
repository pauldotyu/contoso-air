// GET /api/chat/provider
// Lightweight diagnostic endpoint to reveal which chat provider the server will use.
// Does NOT expose any secrets – only presence booleans.

export const dynamic = "force-dynamic"; // ensure no static optimization

type Provider = "azure" | "openai" | "ollama" | "none";
const VALID_PROVIDERS: Provider[] = ["azure", "openai", "ollama", "none"];

function hasAzureConfig(): boolean {
  return Boolean(process.env.AZURE_OPENAI_ENDPOINT) &&
    Boolean(process.env.AZURE_OPENAI_DEPLOYMENT) &&
    Boolean(process.env.AZURE_OPENAI_API_VERSION) &&
    Boolean(process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_CLIENTID || process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID);
}

function hasOpenAIConfig(): boolean { return !!process.env.OPENAI_API_KEY; }

function detectProvider(): { provider: Provider } {
  const forced = process.env.CHAT_PROVIDER?.toLowerCase().trim();
  if (forced && (VALID_PROVIDERS as string[]).includes(forced)) {
    return { provider: forced as Provider };
  }
  if (hasAzureConfig()) return { provider: "azure" };
  if (hasOpenAIConfig()) return { provider: "openai" };
  return { provider: "none" };
}

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o, null, 2), { status, headers: { "Content-Type": "application/json" } });

export async function GET() {
  const { provider } = detectProvider();
  return json({
    provider,
    validProviders: VALID_PROVIDERS,
  });
}
