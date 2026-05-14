export const dynamic = "force-static";

function publisherId() {
  const explicit = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (explicit?.startsWith("pub-")) return explicit;
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (client?.startsWith("ca-pub-")) return client.replace(/^ca-/, "");
  return "";
}

export function GET() {
  const pub = publisherId();
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# Configure NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-xxxxxxxxxxxxxxxx before AdSense review.\n";
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
