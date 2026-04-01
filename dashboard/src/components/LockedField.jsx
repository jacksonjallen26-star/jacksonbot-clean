function LockedField({ children, plan, onUpgrade }) {
  const isLocked = plan === "free";

  if (!isLocked) return children;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ pointerEvents: "none", opacity: 0.4, userSelect: "none" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, cursor: "pointer", borderRadius: 6,
          background: "rgba(10,10,20,0.5)",
        }}
        onClick={onUpgrade}
      >
        <span style={{ fontSize: 13 }}>🔒</span>
        <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
          Upgrade to unlock
        </span>
      </div>
    </div>
  );
}

export default LockedField;