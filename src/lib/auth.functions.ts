import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const employeeEmail = (empNo: string) =>
  `${empNo.trim().toUpperCase()}@aliship.internal`;

type BootstrapInput = {
  employeeNo: string;
  fullName: string;
  password: string;
};

/** One-shot: creates the first super admin. Fails if any super_admin already exists. */
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: BootstrapInput) => {
    if (!d?.employeeNo || !d?.fullName || !d?.password) throw new Error("Missing fields");
    if (d.password.length < 8) throw new Error("Password must be at least 8 characters");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) throw new Error("A super admin already exists");

    const email = employeeEmail(data.employeeNo);
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { employee_no: data.employeeNo.toUpperCase(), full_name: data.fullName },
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Failed to create user");

    const uid = created.user.id;
    const { error: pErr } = await supabaseAdmin.from("profiles").insert({
      user_id: uid,
      employee_no: data.employeeNo.toUpperCase(),
      full_name: data.fullName,
      must_change_password: false,
    });
    if (pErr) throw new Error(pErr.message);

    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: "super_admin" });
    if (rErr) throw new Error(rErr.message);

    return { ok: true, employeeNo: data.employeeNo.toUpperCase() };
  });

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
    if (d.otpPassword.length < 8) throw new Error("OTP must be at least 8 characters");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = employeeEmail(data.employeeNo);

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.otpPassword,
      email_confirm: true,
      user_metadata: { employee_no: data.employeeNo.toUpperCase(), full_name: data.fullName },
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Failed to create user");
    const uid = created.user.id;

    const { error: pErr } = await supabaseAdmin.from("profiles").insert({
      user_id: uid,
      employee_no: data.employeeNo.toUpperCase(),
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
