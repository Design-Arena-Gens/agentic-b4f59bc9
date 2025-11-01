export default function DocsPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>FinMark Networking - How it works</h1>
      <section style={{ display: "grid", gap: 8 }}>
        <h2 style={{ fontSize: 22 }}>Adapter Roles</h2>
        <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>
            <b>Adapter 1 ? NAT</b>: Internet access via VirtualBox?s built-in DHCP. No
            manual configuration inside Windows.
          </li>
          <li>
            <b>Adapter 2 ? Host-Only</b>: Static IP on the Windows guest for the internal
            FinMark LAN. The host side IP acts as the default gateway.
          </li>
        </ul>
      </section>
      <section style={{ display: "grid", gap: 8 }}>
        <h2 style={{ fontSize: 22 }}>Recommended IP Plan</h2>
        <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>
            Windows (guest) IP: <code>192.168.100.10</code>
          </li>
          <li>
            Subnet mask: <code>255.255.255.0</code>
          </li>
          <li>
            Gateway (host side): <code>192.168.100.1</code>
          </li>
          <li>
            DNS: <code>10.10.10.10</code> and fallback <code>8.8.8.8</code>
          </li>
        </ul>
      </section>
      <section style={{ display: "grid", gap: 8 }}>
        <h2 style={{ fontSize: 22 }}>Verification Checklist</h2>
        <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>From Windows, ping <code>192.168.100.1</code> (host).</li>
          <li>From host, ping <code>192.168.100.10</code> (guest).</li>
          <li>From Windows, browse the internet (NAT adapter provides connectivity).</li>
        </ul>
      </section>
    </div>
  );
}
