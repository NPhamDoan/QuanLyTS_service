import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
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
    async create(data) {
        const supabase = getSupabase();
        const maSinhVien = await generateMaSinhVien();
        const now = new Date().toISOString();
        const row = { maSinhVien, ...data, anhDaiDien: null, ngayTao: now, ngayCapNhat: now };
        const { error } = await supabase.from("SinhVien").insert(row);
        if (error)
            throwIfError(error);
        return row;
    }
    async updateAvatar(maSinhVien, anhDaiDien) {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("SinhVien")
            .update({ anhDaiDien })
            .eq("maSinhVien", maSinhVien);
        if (error)
            throwIfError(error);
    }
}
