/**
 * @file Title.tsx
 * @author justKD
 * @fileoverview `export const Title`
 * Just the title. But I think it's also covering the
 * ugly gojs watermark...
 */

import * as React from "react";

export const Title = (): JSX.Element => (
  <div
    style={{
      position: "fixed",
      backgroundColor: "#fff",
      zIndex: Number.MAX_SAFE_INTEGER - 100,
      padding: "20px",
      textAlign: "center",
    }}
  >
    <h2>PowerUp Scenario Builder</h2>
  </div>
);
