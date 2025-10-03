import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PUBLIC_KEY = "project_public_92d4bd18238acf7456e13bebe61112df_xJrm77cb2a0afff1156620845e8b07210c018";

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
    const compressionLevel = formData.get("compressionLevel") as string || "recommended";
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

    const authResponse = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: PUBLIC_KEY }),
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }

    const { token } = await authResponse.json();

    const startResponse = await fetch("https://api.ilovepdf.com/v1/start/compress", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!startResponse.ok) {
      throw new Error(`Start task failed: ${startResponse.status}`);
    }

    const { server, task } = await startResponse.json();

    const uploadFormData = new FormData();
    uploadFormData.append("task", task);
    uploadFormData.append("file", file);

    const uploadResponse = await fetch(`https://${server}/v1/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();

    const processResponse = await fetch(`https://${server}/v1/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        tool: "compress",
        files: [{
          server_filename: uploadData.server_filename,
          filename: file.name
        }],
        compression_level: compressionLevel,
      }),
    });

    if (!processResponse.ok) {
      throw new Error(`Process failed: ${processResponse.status}`);
    }

    const downloadResponse = await fetch(`https://${server}/v1/download/${task}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download failed: ${downloadResponse.status}`);
    }

    const pdfBlob = await downloadResponse.blob();

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