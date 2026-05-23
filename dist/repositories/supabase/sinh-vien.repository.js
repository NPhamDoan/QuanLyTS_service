import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
async function generateMaSinhVien() {
    const year = new Date().getFullYear();
    const prefix = `SV-${year}`;
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("SinhVien")
        .select("maSinhVien")
        .like("maSinhVien", `${prefix}%`)
        .order("maSinhVien", { ascending: false })
        .limit(1);
    if (error)
        throwIfError(error);
    let seq = 1;
    if (data && data.length > 0) {
        const last = data[0].maSinhVien;
        const lastSeq = parseInt(last.slice(prefix.length), 10);
        if (!isNaN(lastSeq))
            seq = lastSeq + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
}
export class SupabaseSinhVienRepository {
    async findById(maSinhVien) {
        logQuery("SupabaseSinhVienRepository", "findById", { maSinhVien });
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("SinhVien")
                .select("*")
                .eq("maSinhVien", maSinhVien)
                .maybeSingle();
            if (error)
                throwIfError(error);
            return data ?? null;
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SupabaseSinhVienRepository", "create", { data });
        try {
            const supabase = getSupabase();
            const maSinhVien = await generateMaSinhVien();
            const now = new Date().toISOString();
            const row = { maSinhVien, ...data, anhDaiDien: null, ngayTao: now, ngayCapNhat: now };
            const { error } = await supabase.from("SinhVien").insert(row);
            if (error)
                throwIfError(error);
            return row;
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "create", err);
            throw err;
        }
    }
    async updateAvatar(maSinhVien, anhDaiDien) {
        logQuery("SupabaseSinhVienRepository", "updateAvatar", { maSinhVien, anhDaiDien });
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from("SinhVien")
                .update({ anhDaiDien })
                .eq("maSinhVien", maSinhVien);
            if (error)
                throwIfError(error);
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "updateAvatar", err);
            throw err;
        }
    }
}
