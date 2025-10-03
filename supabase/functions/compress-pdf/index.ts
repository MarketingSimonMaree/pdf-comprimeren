import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PROXY_URL = "https://pdf-compressor-proxy.vercel.app/api/compress";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const compressionLevel = formData.get("compressionLevel") as string || "2";
    const useCredits = formData.get("useCredits") === "true";

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: usageData } = await supabase
      .from("compression_usage")
      .select("*")
      .eq("ip_address", clientIp)
      .maybeSingle();

    const { data: creditsData } = await supabase
      .from("user_credits")
      .select("*")
      .eq("ip_address", clientIp)
      .maybeSingle();

    const availableCredits = creditsData?.credits || 0;
    const dailyUsage = usageData?.last_compression_date === today ? usageData.compressions_count : 0;

    if (useCredits && availableCredits > 0) {
      await supabase
        .from("user_credits")
        .update({ credits: availableCredits - 1, updated_at: new Date().toISOString() })
        .eq("ip_address", clientIp);
    } else if (dailyUsage >= 5) {
      return new Response(
        JSON.stringify({
          error: "Daily limit reached",
          message: "Je hebt je dagelijkse limiet van 5 gratis compressies bereikt. Koop credits om door te gaan.",
          dailyUsage,
          availableCredits
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      if (usageData) {
        const newCount = usageData.last_compression_date === today ? dailyUsage + 1 : 1;
        await supabase
          .from("compression_usage")
          .update({
            compressions_count: newCount,
            last_compression_date: today,
            updated_at: new Date().toISOString()
          })
          .eq("ip_address", clientIp);
      } else {
        await supabase
          .from("compression_usage")
          .insert({
            ip_address: clientIp,
            compressions_count: 1,
            last_compression_date: today
          });
      }
    }

    const proxyFormData = new FormData();
    proxyFormData.append("fileInput", file);
    proxyFormData.append("optimizeLevel", compressionLevel);

    const proxyResponse = await fetch(PROXY_URL, {
      method: "POST",
      body: proxyFormData,
    });

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Proxy error: ${proxyResponse.status}`);
    }

    const pdfBlob = await proxyResponse.blob();

    return new Response(pdfBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"compressed_${file.name}\"`,
      },
    });
  } catch (error) {
    console.error("Compression error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to compress PDF", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});