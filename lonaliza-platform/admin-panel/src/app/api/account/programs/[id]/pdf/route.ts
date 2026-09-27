import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getUserAiProgram } from "@/lib/ai-programs-pb";
import { buildProgramPdfBuffer } from "@/lib/pdf/program-pdf";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const program = await getUserAiProgram(user.id, id);
  if (!program) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const buffer = await buildProgramPdfBuffer(program);
  const filename = `alrayyan-program-${program.id}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
