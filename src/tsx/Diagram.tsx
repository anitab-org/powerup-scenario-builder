/**
 * @file Diagram.tsx
 * @author justKD
 * @fileoverview `export const Diagram`
 * Create a component for holding the GoJS diagram.
 * Runs the diagram startup script on component mount.
 */

import * as React from "react";

const { useEffect } = React;

export const Diagram = (): JSX.Element => {
  useEffect(() => {
    import("../js/diagram.run.js");
  }, []);
  return (
    <div
      id="diagramDiv"
      style={{
        width: "100%",
        height: "90vh",
      }}
    />
  );
};
