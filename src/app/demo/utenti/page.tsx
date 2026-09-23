import { DEMO_USERS } from "@/lib/demo-data";
import { ROLE_LABEL, formatDate, type UserRole } from "@/lib/types";

export const metadata = { title: "Demo utenti — AppuntiUni" };

const ROLES: UserRole[] = ["buyer", "seller", "admin"];

export default function DemoUsers() {
  return (
    <section className="card overflow-x-auto">
      <header className="px-5 py-4">
        <h1 className="font-semibold">Utenti registrati</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Da qui un amministratore può promuovere un utente o cambiarne il ruolo.
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
          {DEMO_USERS.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-4">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-5 py-4 text-slate-600">{user.university ?? "—"}</td>
              <td className="px-5 py-4 text-slate-600">{formatDate(user.created_at)}</td>
              <td className="px-5 py-4">
                {user.role === "admin" ? (
                  <span className="badge bg-slate-100 text-slate-600">
                    {ROLE_LABEL[user.role]} (tu)
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <select disabled defaultValue={user.role} className="input w-44 py-1.5">
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-secondary py-1.5" disabled>
                      Salva
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
