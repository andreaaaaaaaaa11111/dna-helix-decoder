import { updateUserRole } from "@/app/actions/admin";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL, formatDate, type Profile, type UserRole } from "@/lib/types";

export const metadata = { title: "Utenti — AppuntiUni" };

const ROLES: UserRole[] = ["buyer", "seller", "admin"];

export default async function AdminUsersPage() {
  const me = await requireRole(["admin"], "/dashboard/admin/utenti");
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (data ?? []) as Profile[];

  return (
    <section className="card overflow-x-auto">
      <header className="px-5 py-4">
        <h2 className="font-semibold">Utenti registrati</h2>
        <p className="text-xs text-slate-500">
          Da qui puoi promuovere un utente ad amministratore o cambiarne il ruolo.
        </p>
      </header>

      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-5 py-3">Utente</th>
            <th className="px-5 py-3">Ateneo</th>
            <th className="px-5 py-3">Iscritto il</th>
            <th className="px-5 py-3">Ruolo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{user.full_name ?? "—"}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-5 py-3 text-slate-600">{user.university ?? "—"}</td>
              <td className="px-5 py-3 text-slate-600">{formatDate(user.created_at)}</td>
              <td className="px-5 py-3">
                {user.id === me.id ? (
                  <span className="badge bg-slate-100 text-slate-600">
                    {ROLE_LABEL[user.role]} (tu)
                  </span>
                ) : (
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={user.id} />
                    <select name="role" defaultValue={user.role} className="input w-44 py-1">
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary py-1">
                      Salva
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-slate-600">Nessun utente.</p>
      )}
    </section>
  );
}
