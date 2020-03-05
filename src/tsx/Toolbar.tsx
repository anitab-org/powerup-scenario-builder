/**
 * @file Toolbar.tsx
 * @author justKD
 * @fileoverview `export const Toolbar`
 * Parent container for displaying toolbar components.
 */

import * as React from "react";

import { SaveLoadLayoutButtonGroup } from "./SaveLoadLayoutButtonGroup";
import { ExportSplitButton } from "./ExportSplitButton";
import { SaveLoadLayoutSplitButton } from "./SaveLoadLayoutSplitButton";

import { Button } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

export const Toolbar = ({
  handleHelpDrawer,
}: {
  handleHelpDrawer: () => void;
}): JSX.Element => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        "& > *": {
          margin: theme.spacing(1),
        },
      },
    }),
  );
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Button variant="contained" onClick={handleHelpDrawer}>
        <HelpOutlineIcon />
      </Button>
      <SaveLoadLayoutSplitButton />
      <SaveLoadLayoutButtonGroup />
      <ExportSplitButton />
    </div>
  );
};
