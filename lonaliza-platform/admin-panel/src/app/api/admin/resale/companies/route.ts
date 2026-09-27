import { NextResponse } from "next/server";
import {
  getResellerCompanies,
  getResellerCompany,
  issueLicenseForCompany,
  initCompanyProgress,
  getCompanyProgress,
  getCompanyServer,
  saveCompanyServer,
} from "@/lib/server/resale-store";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { assertOriginOnly } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertOriginOnly("Reseller Companies API");
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("id");

    if (companyId) {
      const [company, progress, server] = await Promise.all([
        getResellerCompany(companyId),
        getCompanyProgress(companyId),
        getCompanyServer(companyId),
      ]);
      return NextResponse.json({ ok: true, company, progress, server });
    }

    const companies = await getResellerCompanies();
    return NextResponse.json({ ok: true, companies });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load companies";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    assertOriginOnly("Reseller Companies API");
    const body = (await req.json()) as {
      action: "update_status" | "issue_license" | "save_server" | "update_progress";
      companyId: string;
      status?: "registered" | "paid" | "provisioning" | "active" | "suspended";
      notes?: string;
      ipAddress?: string;
      aapanelUrl?: string;
      aapanelNotes?: string;
      stageId?: string;
      stageStatus?: "pending" | "in_progress" | "done" | "skipped";
    };

    if (!body.companyId) {
      return NextResponse.json({ ok: false, error: "companyId is required" }, { status: 400 });
    }

    const pb = await createAdminPocketBase();

    if (body.action === "update_status" && body.status) {
      await pb.collection("reseller_companies").update(body.companyId, {
        status: body.status,
        ...(body.notes ? { notes: body.notes } : {}),
      });

      if (body.status === "paid" || body.status === "provisioning" || body.status === "active") {
        await initCompanyProgress(body.companyId);
        await issueLicenseForCompany(body.companyId);
      }

      return NextResponse.json({ ok: true, message: "Company status updated" });
    }

    if (body.action === "issue_license") {
      const license = await issueLicenseForCompany(body.companyId);
      return NextResponse.json({ ok: true, license });
    }

    if (body.action === "save_server" && body.ipAddress) {
      const server = await saveCompanyServer(body.companyId, {
        ipAddress: body.ipAddress,
        aapanelUrl: body.aapanelUrl,
        aapanelNotes: body.aapanelNotes,
      });
      return NextResponse.json({ ok: true, server });
    }

    if (body.action === "update_progress" && body.stageId && body.stageStatus) {
      const progressRecords = await pb.collection("reseller_progress").getFullList({
        filter: `company="${body.companyId}" && stage="${body.stageId}"`,
      });
      if (progressRecords.length > 0) {
        await pb.collection("reseller_progress").update(progressRecords[0].id, {
          status: body.stageStatus,
          notes: body.notes || "",
          completedAt: body.stageStatus === "done" ? new Date().toISOString() : null,
        });
      }
      return NextResponse.json({ ok: true, message: "Stage progress updated" });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process request";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
