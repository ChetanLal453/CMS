import ModuleShell from '@/components/admin/ModuleShell'

const UsersPage = () => {
  return (
    <ModuleShell
      className="users-wrap"
      title="Users"
      description="Manage admin access, roles, and basic account activity."
      actions={(
        <>
          <button className="gbtn" type="button">Export CSV</button>
          <button className="gbtn pu" type="button">+ Invite User</button>
        </>
      )}>
      <div className="tbl-wrap">
        <div className="tbl-toolbar">
          <input className="srch" placeholder="Search by name or email…" />
          <button className="gbtn" type="button">All roles ↓</button>
          <button className="gbtn" type="button">Status ↓</button>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Signed up</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td className="t-strong">Adams Khan</td><td>adams@curvemetrics.in</td><td><span className="badge ba">Admin</span></td><td className="mono">Jan 5, 2024</td><td><span className="status-good">● Active</span></td></tr>
            <tr><td className="t-strong">Riya Sharma</td><td>riya@gmail.com</td><td><span className="badge bu">User</span></td><td className="mono">Mar 22, 2026</td><td><span className="status-good">● Active</span></td></tr>
            <tr><td className="t-strong">Aarav Mehta</td><td>aarav.m@outlook.com</td><td><span className="badge bu">User</span></td><td className="mono">Mar 19, 2026</td><td><span className="status-warn">● Inactive</span></td></tr>
            <tr><td className="t-strong">Priya Nair</td><td>priya.nair@yahoo.com</td><td><span className="badge bu">User</span></td><td className="mono">Mar 15, 2026</td><td><span className="status-good">● Active</span></td></tr>
            <tr><td className="t-strong">Karan Patel</td><td>karan.p@gmail.com</td><td><span className="badge bu">User</span></td><td className="mono">Mar 10, 2026</td><td><span className="status-bad">● Banned</span></td></tr>
          </tbody>
        </table>
      </div>
    </ModuleShell>
  )
}

export default UsersPage
