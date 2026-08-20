import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AdminRecord, ModuleDef } from "@/lib/admin/registry";

type CollectionRow = {
  record_id: string;
  data: Record<string, unknown>;
};

function rowToRecord(row: CollectionRow): AdminRecord {
  return {
    ...row.data,
    id: row.record_id,
  } as AdminRecord;
}

/**
 * Convert a real Supabase students row into the field names
 * currently used by the existing Students UI.
 *
 * IMPORTANT:
 * We are preserving the existing CrudModule UI.
 * Only the data source is changing.
 */
function studentRowToRecord(row: Record<string, unknown>): AdminRecord {
  return {
    id: String(row.id ?? ""),

    // Existing Students UI fields
    studentId: String(row.student_id ?? ""),
    name: String(row.student_name ?? ""),
    className: String(row.applying_for ?? ""),
    section: "",
    roll: "",
    registration: String(row.birth_registration_no ?? ""),
    gender: String(row.gender ?? ""),
    guardianPhone: String(row.phone ?? ""),
    admittedOn: String(row.created_at ?? "").slice(0, 10),
  } as AdminRecord;
}

/**
 * Convert the existing Students UI draft back into
 * the real public.students column names.
 */
function studentRecordToDatabase(
  record: AdminRecord,
): Record<string, unknown> {
  return {
    student_id: String(record.studentId ?? "").trim(),
    student_name: String(record.name ?? "").trim(),
    applying_for: String(record.className ?? "").trim(),
    gender: String(record.gender ?? "").trim(),
    phone: String(record.guardianPhone ?? "").trim(),
    birth_registration_no:
      String(record.registration ?? "").trim() || null,
  };
}

/**
 * Data access layer for admin modules.
 *
 * Students:
 *   Uses the real public.students table.
 *
 * Other modules:
 *   Continue using admin_collections for now.
 *
 * Admissions:
 *   Has its own dedicated page/table and does not use this store.
 */
export function useCollection(mod: ModuleDef) {
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ==========================================================
  // STUDENTS — REAL SUPABASE TABLE
  // ==========================================================

  const loadStudents = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load students:",
        error,
      );

      setRows([]);
      setLoading(false);
      return;
    }

    setRows(
      (data ?? []).map((row) =>
        studentRowToRecord(
          row as Record<string, unknown>,
        ),
      ),
    );

    setLoading(false);
  }, []);

  // ==========================================================
  // GENERIC ADMIN COLLECTIONS
  // ==========================================================

  const loadCollection = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("admin_collections")
      .select("record_id, data")
      .eq("module_id", mod.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        `Failed to load "${mod.id}" records:`,
        error,
      );

      setRows([]);
      setLoading(false);
      return;
    }

    setRows(
      ((data ?? []) as CollectionRow[]).map(
        rowToRecord,
      ),
    );

    setLoading(false);
  }, [mod.id]);

  // ==========================================================
  // LOAD
  // ==========================================================

  const load = useCallback(async () => {
    if (mod.id === "students") {
      await loadStudents();
      return;
    }

    await loadCollection();
  }, [
    mod.id,
    loadStudents,
    loadCollection,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  // ==========================================================
  // CREATE
  // ==========================================================

  const create = useCallback(
    async (
      record: Omit<AdminRecord, "id">,
    ) => {
      setBusy(true);

      try {
        // ----------------------------------------------------
        // STUDENTS
        // ----------------------------------------------------

        if (mod.id === "students") {
          const studentData =
            studentRecordToDatabase(
              record as AdminRecord,
            );

          const { data, error } =
            await supabase
              .from("students")
              .insert(studentData)
              .select("*")
              .single();

          if (error) {
            console.error(
              "Failed to create student:",
              error,
            );

            throw error;
          }

          const next =
            studentRowToRecord(
              data as Record<string, unknown>,
            );

          setRows((current) => [
            next,
            ...current,
          ]);

          return next;
        }

        // ----------------------------------------------------
        // OTHER MODULES
        // ----------------------------------------------------

        const recordId =
          typeof crypto !== "undefined" &&
          "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)}`;

        const { error } =
          await supabase
            .from("admin_collections")
            .insert({
              module_id: mod.id,
              record_id: recordId,
              data: record,
            });

        if (error) {
          console.error(
            `Failed to create "${mod.id}" record:`,
            error,
          );

          throw error;
        }

        const next: AdminRecord = {
          ...record,
          id: recordId,
        };

        setRows((current) => [
          next,
          ...current,
        ]);

        return next;
      } finally {
        setBusy(false);
      }
    },
    [mod.id],
  );

  // ==========================================================
  // SAVE / UPDATE
  // ==========================================================

  const save = useCallback(
    async (record: AdminRecord) => {
      setBusy(true);

      try {
        // ----------------------------------------------------
        // STUDENTS
        // ----------------------------------------------------

        if (mod.id === "students") {
          const studentData =
            studentRecordToDatabase(
              record,
            );

          const { data, error } =
            await supabase
              .from("students")
              .update(studentData)
              .eq("id", record.id)
              .select("*")
              .single();

          if (error) {
            console.error(
              "Failed to update student:",
              error,
            );

            throw error;
          }

          const updated =
            studentRowToRecord(
              data as Record<string, unknown>,
            );

          setRows((current) =>
            current.map((row) =>
              row.id === record.id
                ? updated
                : row,
            ),
          );

          return;
        }

        // ----------------------------------------------------
        // OTHER MODULES
        // ----------------------------------------------------

        const { id, ...data } =
          record;

        const { error } =
          await supabase
            .from("admin_collections")
            .update({
              data,
            })
            .eq("module_id", mod.id)
            .eq("record_id", id);

        if (error) {
          console.error(
            `Failed to update "${mod.id}" record:`,
            error,
          );

          throw error;
        }

        setRows((current) =>
          current.map((row) =>
            row.id === id
              ? record
              : row,
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [mod.id],
  );

  // ==========================================================
  // DELETE
  // ==========================================================

  const remove = useCallback(
    async (id: string) => {
      setBusy(true);

      try {
        // ----------------------------------------------------
        // STUDENTS
        // ----------------------------------------------------

        if (mod.id === "students") {
          const { error } =
            await supabase
              .from("students")
              .delete()
              .eq("id", id);

          if (error) {
            console.error(
              "Failed to delete student:",
              error,
            );

            throw error;
          }

          setRows((current) =>
            current.filter(
              (row) => row.id !== id,
            ),
          );

          return;
        }

        // ----------------------------------------------------
        // OTHER MODULES
        // ----------------------------------------------------

        const { error } =
          await supabase
            .from("admin_collections")
            .delete()
            .eq("module_id", mod.id)
            .eq("record_id", id);

        if (error) {
          console.error(
            `Failed to delete "${mod.id}" record:`,
            error,
          );

          throw error;
        }

        setRows((current) =>
          current.filter(
            (row) => row.id !== id,
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [mod.id],
  );

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = useCallback(async () => {
    /**
     * NEVER reset the real students table from demo seed data.
     *
     * The existing CrudModule has a Reset button.
     * For Students we deliberately disable that operation.
     */
    if (mod.id === "students") {
      throw new Error(
        "The Students module cannot be reset.",
      );
    }

    setBusy(true);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("admin_collections")
        .delete()
        .eq("module_id", mod.id);

      if (deleteError) {
        console.error(
          `Failed to clear "${mod.id}" records:`,
          deleteError,
        );

        throw deleteError;
      }

      if (mod.seed.length > 0) {
        const {
          error: insertError,
        } = await supabase
          .from("admin_collections")
          .insert(
            mod.seed.map(
              ({
                id,
                ...data
              }) => ({
                module_id: mod.id,
                record_id: id,
                data,
              }),
            ),
          );

        if (insertError) {
          console.error(
            `Failed to seed "${mod.id}" records:`,
            insertError,
          );

          throw insertError;
        }
      }

      await load();
    } finally {
      setBusy(false);
    }
  }, [
    mod.id,
    mod.seed,
    load,
  ]);

  return {
    rows,
    loading,
    busy,
    create,
    save,
    remove,
    reset,
  } as const;
}