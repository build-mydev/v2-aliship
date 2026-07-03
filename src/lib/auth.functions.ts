import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const NUMERIC = /^\d{6,}$/;

export const employeeEmail = (empNo: string) =>
  `${empNo.trim()}@aliship.internal`;

type ProvisionInput = {
  employeeNo: string;
  fullName: string;
  phone?: string;
  role: "super_admin" | "office" | "dc_admin" | "rider";
  siteId?: string | null;
  otpPassword: string;
};

/** Admin-only: creates a user with a one-time password; user must change on first login. */
export const provisionUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ProvisionInput) => {
    if (!d?.employeeNo || !d?.fullName || !d?.role || !d?.otpPassword) throw new Error("Missing fields");
    if (!NUMERIC.test(d.employeeNo)) throw new Error("Employee No. must be digits only (min 6)");
    if (d.otpPassword.length < 6) throw new Error("Password must be at least 6 characters");
    if (d.role !== "super_admin" && !d.siteId) throw new Error("Site assignment is required for this role");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: adminRow, error: rErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!adminRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = employeeEmail(data.employeeNo);

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.otpPassword,
      email_confirm: true,
      user_metadata: { employee_no: data.employeeNo, full_name: data.fullName },
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Failed to create user");
    const uid = created.user.id;

    const { error: pErr } = await supabaseAdmin.from("profiles").insert({
      user_id: uid,
      employee_no: data.employeeNo,
      full_name: data.fullName,
      phone: data.phone ?? null,
      site_id: data.siteId ?? null,
      must_change_password: true,
    });
    if (pErr) throw new Error(pErr.message);

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    return { ok: true };
  });
