"use client";

import { useMemo, useState } from "react";

type NetworkConfig = {
  hostOnlyIp: string;
  hostOnlyMask: string;
  hostOnlyGateway: string;
  dnsPrimary: string;
  dnsSecondary: string;
  vmName: string;
  hostOnlyName: string;
  windowsInterfaceName: string;
};

const defaultConfig: NetworkConfig = {
  hostOnlyIp: "192.168.100.10",
  hostOnlyMask: "255.255.255.0",
  hostOnlyGateway: "192.168.100.1",
  dnsPrimary: "10.10.10.10",
  dnsSecondary: "8.8.8.8",
  vmName: "FinMark Server",
  hostOnlyName: "vboxnet0",
  windowsInterfaceName: "Ethernet",
};

function ipToCidr(mask: string): number | null {
  const parts = mask.split(".");
  if (parts.length !== 4) return null;
  const bin = parts
    .map((p) => Number(p))
    .map((n) => (n >= 0 && n <= 255 ? n : NaN))
    .map((n) => (Number.isNaN(n) ? "" : n.toString(2).padStart(8, "0")))
    .join("");
  if (!/^1*0*$/.test(bin)) return null; // must be contiguous ones then zeros
  return bin.indexOf("0") === -1 ? 32 : bin.indexOf("0");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d{1,3}$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

export default function Home() {
  const [cfg, setCfg] = useState<NetworkConfig>(defaultConfig);

  const cidr = useMemo(() => ipToCidr(cfg.hostOnlyMask), [cfg.hostOnlyMask]);
  const isValid = useMemo(() => {
    return (
      isValidIp(cfg.hostOnlyIp) &&
      isValidIp(cfg.hostOnlyGateway) &&
      isValidIp(cfg.dnsPrimary) &&
      (cfg.dnsSecondary === "" || isValidIp(cfg.dnsSecondary)) &&
      ipToCidr(cfg.hostOnlyMask) !== null &&
      cfg.vmName.trim().length > 0 &&
      cfg.hostOnlyName.trim().length > 0 &&
      cfg.windowsInterfaceName.trim().length > 0
    );
  }, [cfg]);

  const vboxHostOnlyCommands = useMemo(() => {
    const mask = cfg.hostOnlyMask;
    return [
      `# Create host-only network if needed`,
      `VBoxManage list hostonlyifs | rg -q "^Name:\\s+${cfg.hostOnlyName}$" || VBoxManage hostonlyif create`,
      `# Configure host-only adapter on host`,
      `VBoxManage hostonlyif ipconfig ${cfg.hostOnlyName} --ip ${cfg.hostOnlyGateway} --netmask ${mask}`,
      `# Attach to VM on adapter 2`,
      `VBoxManage modifyvm "${cfg.vmName}" --nic2 hostonly --hostonlyadapter2 "${cfg.hostOnlyName}"`,
      `# Ensure adapter 1 is NAT for internet`,
      `VBoxManage modifyvm "${cfg.vmName}" --nic1 nat`,
    ].join("\n");
  }, [cfg]);

  const windowsNetshCommands = useMemo(() => {
    const iface = cfg.windowsInterfaceName;
    const lines = [
      `netsh interface ip set address name="${iface}" static ${cfg.hostOnlyIp} ${cfg.hostOnlyMask} ${cfg.hostOnlyGateway}`,
      `netsh interface ip set dns name="${iface}" static ${cfg.dnsPrimary}`,
    ];
    if (cfg.dnsSecondary) {
      lines.push(`netsh interface ip add dns name="${iface}" ${cfg.dnsSecondary} index=2`);
    }
    return lines.join("\n");
  }, [cfg]);

  const powershellCommands = useMemo(() => {
    const prefixLen = cidr ?? 24;
    const iface = cfg.windowsInterfaceName;
    return [
      `$if = Get-NetAdapter | Where-Object { $_.Name -eq "${iface}" }`,
      `New-NetIPAddress -InterfaceAlias "${iface}" -IPAddress ${cfg.hostOnlyIp} -PrefixLength ${prefixLen} -DefaultGateway ${cfg.hostOnlyGateway}`,
      `Set-DnsClientServerAddress -InterfaceAlias "${iface}" -ServerAddresses ${cfg.dnsSecondary ? `\"${cfg.dnsPrimary}\",\"${cfg.dnsSecondary}\"` : `\"${cfg.dnsPrimary}\"`}`,
    ].join("\n");
  }, [cfg, cidr]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ display: "grid", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>FinMark Network Configurator</h1>
        <p style={{ color: "#888" }}>
          Adapter 1: NAT via DHCP (no changes). Adapter 2: Host-Only static IP on
          the Windows guest. Fill or adjust values and copy commands.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          alignItems: "end",
        }}
      >
        <TextField
          label="VM Name"
          value={cfg.vmName}
          onChange={(vmName) => setCfg({ ...cfg, vmName })}
        />
        <TextField
          label="Host-Only Adapter Name"
          hint="Usually vboxnet0"
          value={cfg.hostOnlyName}
          onChange={(hostOnlyName) => setCfg({ ...cfg, hostOnlyName })}
        />
        <TextField
          label="Windows Interface Name"
          hint='e.g. "Ethernet" or "Ethernet 2"'
          value={cfg.windowsInterfaceName}
          onChange={(windowsInterfaceName) => setCfg({ ...cfg, windowsInterfaceName })}
        />
        <TextField
          label="Host-Only IP (guest)"
          value={cfg.hostOnlyIp}
          onChange={(hostOnlyIp) => setCfg({ ...cfg, hostOnlyIp })}
        />
        <TextField
          label="Subnet mask"
          value={cfg.hostOnlyMask}
          onChange={(hostOnlyMask) => setCfg({ ...cfg, hostOnlyMask })}
        />
        <TextField
          label="Default gateway"
          value={cfg.hostOnlyGateway}
          onChange={(hostOnlyGateway) => setCfg({ ...cfg, hostOnlyGateway })}
        />
        <TextField
          label="Preferred DNS"
          value={cfg.dnsPrimary}
          onChange={(dnsPrimary) => setCfg({ ...cfg, dnsPrimary })}
        />
        <TextField
          label="Alternate DNS"
          value={cfg.dnsSecondary}
          onChange={(dnsSecondary) => setCfg({ ...cfg, dnsSecondary })}
        />
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2 style={{ fontSize: 22 }}>1) Configure VirtualBox (host)</h2>
        <p style={{ color: "#888" }}>
          Creates and configures host-only network, attaches it to adapter 2, and
          ensures adapter 1 is NAT.
        </p>
        <CommandBlock
          disabled={!isValid}
          title="VBoxManage (macOS/Linux/Windows host)"
          command={vboxHostOnlyCommands}
          onCopy={() => copy(vboxHostOnlyCommands)}
        />
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2 style={{ fontSize: 22 }}>2) Configure Windows (guest)</h2>
        <p style={{ color: "#888" }}>
          Set static IP on the host-only interface inside Windows. Replace the
          interface name if different.
        </p>
        <CommandBlock
          disabled={!isValid}
          title="netsh (Cmd)"
          command={windowsNetshCommands}
          onCopy={() => copy(windowsNetshCommands)}
        />
        <CommandBlock
          disabled={!isValid}
          title="PowerShell"
          command={powershellCommands}
          onCopy={() => copy(powershellCommands)}
        />
      </section>

      <section style={{ display: "grid", gap: 8, color: "#888" }}>
        <b>Notes</b>
        <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>
            NAT adapter uses DHCP. No manual configuration is required for
            internet access.
          </li>
          <li>
            Host-only gateway is the host side IP (e.g., 192.168.100.1) and DNS
            can be your internal resolver plus a public fallback.
          </li>
          <li>
            If you change subnet, ensure gateway and VM IP are within the same
            subnet and not conflicting.
          </li>
        </ul>
      </section>
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
}) {
  const { label, value, onChange, hint } = props;
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(127,127,127,0.3)",
          background: "transparent",
          color: "inherit",
        }}
      />
      {hint ? <span style={{ color: "#888", fontSize: 12 }}>{hint}</span> : null}
    </label>
  );
}

function CommandBlock(props: {
  title: string;
  command: string;
  onCopy: () => void;
  disabled?: boolean;
}) {
  const { title, command, onCopy, disabled } = props;
  return (
    <div
      style={{
        border: "1px solid rgba(127,127,127,0.3)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(127,127,127,0.08)",
        }}
      >
        <span style={{ fontWeight: 600 }}>{title}</span>
        <button
          disabled={disabled}
          onClick={onCopy}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(127,127,127,0.3)",
            background: disabled ? "rgba(127,127,127,0.2)" : "transparent",
            color: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          Copy
        </button>
      </div>
      <pre
        style={{
          padding: 12,
          whiteSpace: "pre-wrap",
          overflowX: "auto",
          fontSize: 13,
        }}
      >
        <code>{command}</code>
      </pre>
    </div>
  );
}
