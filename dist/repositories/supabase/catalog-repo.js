/**
 * Generic Supabase catalog repository builder. Đối xứng với
 * `sqlite/catalog-repo.ts`. Xem comment ở file đó cho mục đích chung.
 *
 * Khác biệt API so với SQLite:
 * - Dùng PostgREST query builder của @supabase/supabase-js.
 * - SELECT có thể embed quan hệ (vd "NamTuyenSinh:namTuyenSinhId (nam)").
 * - ORDER chain qua nhiều `.order()` consecutive.
 * - JOIN trả về nested object → cần `flatten` để chuyển về flat shape của
 *   domain entity (vd DotTuyenSinh).
 */
import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
import { NotFoundError } from "../../domain/errors.js";
export function makeSupabaseCatalogRepo(config) {
    const cls = config.className;
    const trangThaiCol = config.trangThaiColumn ?? "trangThai";
    const trangThaiDefaultCol = config.trangThaiDefaultColumn ?? "trangThai";
    const flatten = config.flatten ?? ((row) => row);
    function applyOrders(query) {
        let q = query;
        for (const { column, ascending } of config.orders) {
            q = q.order(column, ascending !== undefined ? { ascending } : undefined);
        }
        return q;
    }
    async function findAll() {
        logQuery(cls, "findAll", {});
        try {
            const base = getSupabase()
                .from(config.tableName)
                .select(config.selectClause);
            const { data, error } = await applyOrders(base);
            if (error)
                throwIfError(error);
            return (data || []).map(flatten);
        }
        catch (err) {
            logQueryError(cls, "findAll", err);
            throw err;
        }
    }
    async function findAllActive() {
        logQuery(cls, "findAllActive", {});
        try {
            const base = getSupabase()
                .from(config.tableName)
                .select(config.selectClause)
                .eq(trangThaiCol, "hoat_dong");
            const { data, error } = await applyOrders(base);
            if (error)
                throwIfError(error);
            return (data || []).map(flatten);
        }
        catch (err) {
            logQueryError(cls, "findAllActive", err);
            throw err;
        }
    }
    async function findById(id) {
        logQuery(cls, "findById", { id });
        try {
            const { data, error } = await getSupabase()
                .from(config.tableName)
                .select(config.selectClause)
                .eq("id", id)
                .maybeSingle();
            if (error)
                throwIfError(error);
            return data ? flatten(data) : null;
        }
        catch (err) {
            logQueryError(cls, "findById", err);
            throw err;
        }
    }
    async function create(data) {
        logQuery(cls, "create", { data });
        try {
            const now = new Date().toISOString();
            const insertRow = {
                ngayTao: now,
                ngayCapNhat: now,
            };
            for (const col of config.writableColumns) {
                const v = data[col];
                if (v === undefined && col === trangThaiDefaultCol) {
                    insertRow[col] = "hoat_dong";
                }
                else if (v !== undefined) {
                    insertRow[col] = v;
                }
            }
            const { data: inserted, error } = await getSupabase()
                .from(config.tableName)
                .insert(insertRow)
                .select(config.selectClause)
                .single();
            if (error)
                throwIfError(error, { conflict: config.conflictMessage });
            return flatten(inserted);
        }
        catch (err) {
            logQueryError(cls, "create", err);
            throw err;
        }
    }
    async function update(id, data) {
        logQuery(cls, "update", { id, data });
        try {
            const existing = await findById(id);
            if (!existing)
                throw new NotFoundError(config.notFoundEntity);
            const updates = {
                ngayCapNhat: new Date().toISOString(),
            };
            for (const col of config.writableColumns) {
                const v = data[col];
                if (v !== undefined) {
                    updates[col] = v;
                }
            }
            const { data: updated, error } = await getSupabase()
                .from(config.tableName)
                .update(updates)
                .eq("id", id)
                .select(config.selectClause)
                .single();
            if (error)
                throwIfError(error, { conflict: config.conflictMessage });
            return flatten(updated);
        }
        catch (err) {
            logQueryError(cls, "update", err);
            throw err;
        }
    }
    async function deleteOne(id) {
        logQuery(cls, "delete", { id });
        try {
            const existing = await findById(id);
            if (!existing)
                throw new NotFoundError(config.notFoundEntity);
            const { error } = await getSupabase()
                .from(config.tableName)
                .delete()
                .eq("id", id);
            if (error)
                throwIfError(error, { foreignKey: config.foreignKeyMessage });
        }
        catch (err) {
            logQueryError(cls, "delete", err);
            throw err;
        }
    }
    return {
        findAll,
        findAllActive,
        findById,
        create,
        update,
        delete: deleteOne,
    };
}
