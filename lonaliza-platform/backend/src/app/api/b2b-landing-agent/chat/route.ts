import { NextResponse } from "next/server";
import { processB2BLandingChat } from "@/lib/automation/b2b-landing-agent";
import { getB2BLandingAgentConfig } from "@/lib/automation/b2b-landing-agent-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const config = getB2BLandingAgentConfig();
    if (!config.enabled) {
      return NextResponse.json(
        { ok: false, error: "B2B Landing Agent is currently disabled." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      sessionId?: string;
      visitorName?: string;
      companyName?: string;
      phoneOrEmail?: string;
      message?: string;
      history?: Array<{ sender: "agent" | "visitor"; text: string }>;
      locale?: string;
    };

    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const result = await processB2BLandingChat({
      sessionId: body.sessionId,
      visitorName: body.visitorName,
      companyName: body.companyName,
      phoneOrEmail: body.phoneOrEmail,
      message: body.message.trim(),
      history: Array.isArray(body.history) ? body.history : [],
      locale: body.locale || "ar",
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("[B2B Landing Chat Route Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = getB2BLandingAgentConfig();
  return NextResponse.json({
    ok: true,
    agentName: config.agentName,
    agentTitleAr: config.agentTitleAr,
    welcomeMessageAr: config.welcomeMessageAr,
    welcomeMessageEn: config.welcomeMessageEn,
    packages: config.packages,
    serverSpecs: config.serverSpecsHighlightsAr,
    economicComparisonEnabled: config.economicComparisonEnabled,
  });
}
