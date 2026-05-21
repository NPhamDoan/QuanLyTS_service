import { randomUUID } from "crypto";
import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
export class SupabaseTepDinhKemRepository {
    async findById(maTep) {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("TepDinhKem")
            .select("*")
            .eq("maTep", maTep)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data || null;
    }
    async findByHoSo(maHoSo) {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("TepDinhKem")
            .select("*")
            .eq("maHoSo", maHoSo);
        if (error)
            throwIfError(error);
        return data || [];
    }
    async create(data) {
        const maTep = randomUUID();
        const row = { maTep, ...data };
        const supabase = getSupabase();
        const { error } = await supabase.from("TepDinhKem").insert(row);
        if (error)
            throwIfError(error);
        return row;
    }
    async delete(maTep) {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("TepDinhKem")
            .delete()
            .eq("maTep", maTep);
        if (error)
            throwIfError(error);
    }
}
