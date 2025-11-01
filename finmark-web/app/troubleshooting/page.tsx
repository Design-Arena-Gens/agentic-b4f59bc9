export default function TroubleshootingPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Troubleshooting</h1>
      <section style={{ display: "grid", gap: 8 }}>
        <h2 style={{ fontSize: 22 }}>Common issues</h2>
        <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>
            <b>No internet in Windows</b>: Ensure Adapter 1 is set to <b>NAT</b> and
            the adapter is enabled. Inside Windows, leave this adapter on DHCP.
          </li>
          <li>
            <b>Host cannot reach guest</b>: Verify Windows firewall allows ICMP echo
            (ping) on the host-only profile or allow the app/ports you need.
          </li>
          <li>
            <b>IP conflict</b>: Make sure no other device uses <code>192.168.100.10</code>.
            You can pick a different IP in the same subnet.
          </li>
          <li>
            <b>Wrong gateway</b>: The default gateway for host-only should be the host
            side IP (e.g., <code>192.168.100.1</code>), not an external router.
          </li>
          <li>
            <b>DNS resolution fails</b>: Use the internal resolver <code>10.10.10.10</code>
            and a public fallback <code>8.8.8.8</code>.
          </li>
        </ul>
      </section>
    </div>
  );
}
