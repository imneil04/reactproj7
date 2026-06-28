import { createClient } from "@/lib/supabase/server";

export type AuditAction = "create" | "update" | "delete" | "import";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  entityName: string;
  details: Record<string, unknown> | null;
  createdByEmail: string | null;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  entity_name: string;
  details: Record<string, unknown> | null;
  created_by_email: string | null;
  created_at: string;
}

export interface AuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  entityName: string;
  details?: Record<string, unknown>;
}

export async function recordAuditLog(input: AuditLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_name: input.entityName,
    details: input.details ?? null,
    created_by: user?.id ?? null,
    created_by_email: user?.email ?? null,
  });

  if (error) {
    console.error("Unable to record audit log", error.message);
  }
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    details: row.details,
    createdByEmail: row.created_by_email,
    createdAt: row.created_at,
  };
}

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      entity_name,
      details,
      created_by_email,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { logs: [], error: error.message };
  }

  return {
    logs: (data ?? []).map((row) => mapAuditLog(row as AuditLogRow)),
    error: null,
  };
}
